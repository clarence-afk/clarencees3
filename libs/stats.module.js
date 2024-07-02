

var Stats = function () {

	var mode = 0;

	var container = document.createElement( 'div' );
	container.style.cssText = 'position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000';
	container.addEventListener( 'click', function ( event ) {

		event.preventDefault();
		showPanel( ++ mode % container.children.length );

	}, false );

	//

	function addPanel( panel ) {

		container.appendChild( panel.dom );
		return panel;

	}

	function showPanel( id ) {

		for ( var i = 0; i < container.children.length; i ++ ) {

			container.children[ i ].style.display = i === id ? 'block' : 'none';

		}

		mode = id;

	}

	//

	var beginTime = ( performance || Date ).now(), prevTime = beginTime, frames = 0;

	var fpsPanel = addPanel( new Stats.Panel( 'FPS', '#0ff', '#002' ) );
	var msPanel = addPanel( new Stats.Panel( 'MS', '#0f0', '#020' ) );

	if ( self.performance && self.performance.memory ) {

		var memPanel = addPanel( new Stats.Panel( 'MB', '#f08', '#201' ) );

	}

	showPanel( 0 );

	return {

		REVISION: 16,

		dom: container,

		addPanel: addPanel,
		showPanel: showPanel,

		begin: function () {

			beginTime = ( performance || Date ).now();

		},

		end: function () {

			frames ++;

			var time = ( performance || Date ).now();

			msPanel.update( time - beginTime, 200 );

			if ( time >= prevTime + 1000 ) {

				fpsPanel.update( ( frames * 1000 ) / ( time - prevTime ), 100 );

				prevTime = time;
				frames = 0;

				if ( memPanel ) {

					var memory = performance.memory;
					memPanel.update( memory.usedJSHeapSize / 1048576, memory.jsHeapSizeLimit / 1048576 );

				}

			}

			return time;

		},

		update: function () {

			beginTime = this.end();

		},

		// Backwards Compatibility

		domElement: container,
		setMode: showPanel

	};

};

Stats.Panel = function (name, fg, bg) {
	var min = Infinity, max = 0, round = Math.round;
	var PR = round(window.devicePixelRatio || 1);

	var WIDTH = 80 * PR, HEIGHT = 80 * PR,
		TEXT_X = 3 * PR, TEXT_Y = 2 * PR,
		GRAPH_X = 3 * PR, GRAPH_Y = 3 * PR,
		GRAPH_RADIUS = 30 * PR;

	var canvas = document.createElement('canvas');
	canvas.width = WIDTH;
	canvas.height = HEIGHT;
	canvas.style.cssText = 'width:80px;height:80px';

	var context = canvas.getContext('2d');
	context.font = 'bold ' + (9 * PR) + 'px Helvetica,Arial,sans-serif';
	context.textBaseline = 'top';

	context.fillStyle = bg;
	context.fillRect(0, 0, WIDTH, HEIGHT);

	context.fillStyle = fg;
	context.fillText(name, TEXT_X, TEXT_Y);

	return {
		dom: canvas,

		update: function (value, maxValue) {
			min = Math.min(min, value);
			max = Math.max(max, value);

			context.fillStyle = bg;
			context.globalAlpha = 1;
			context.fillRect(0, 0, WIDTH, HEIGHT);
			context.fillStyle = fg;
			context.fillText(round(value) + ' ' + name + ' (' + round(min) + '-' + round(max) + ')', TEXT_X, TEXT_Y);

			var startAngle = 0;
			var endAngle = (value / maxValue) * 2 * Math.PI;
			context.beginPath();
			context.arc(GRAPH_X + GRAPH_RADIUS, GRAPH_Y + GRAPH_RADIUS, GRAPH_RADIUS, startAngle, endAngle);
			context.fillStyle = fg;
			context.fill();

			context.beginPath();
			context.arc(GRAPH_X + GRAPH_RADIUS, GRAPH_Y + GRAPH_RADIUS, GRAPH_RADIUS, endAngle, 2 * Math.PI);
			context.fillStyle = bg;
			context.fill();
		}
	};
};

export { Stats };
