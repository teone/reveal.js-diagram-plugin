/**
 * reveal.js plugin to integrate d3.js visualizations into presentations.
 */
var Reveald3js = window.Reveald3js || (function(){

    function initialize(element, id, file, transitions) {
        console.log("opening figure '"+ file + "'");

        // get slide, slide background and container
        var background = element.tagName == 'SECTION',
            slide = background ? element : element.closest('section'),
            idx = Reveal.getIndices(slide),
            slide_background = background ? Reveal.getSlideBackground(idx.h, idx.v) : undefined;
            container = background ? slide_background : element;

        // embed html files as iframe
        // allowfullscreen mozallowfullscreen webkitallowfullscreen style="width: 100%; height: 100%; max-height: 100%; max-width: 100%;"
        var iframe = d3.select(container)
            .append('iframe')
            .attr('id', id)
            .attr('sandbox', 'allow-popups allow-scripts allow-forms allow-same-origin')
            .attr('src', file)
            .attr('marginwidth', 0)
            .attr('marginheight', 0)
            .attr('scrolling', 'no')
            .style('width', '100%')
            .style('height', '100%')
            .style('max-width', '100%')
            .style('max-height', '100%')
            .style('z-index', 1)
            .node();

        // iframe load event
        iframe.onload = function() {
            var fig = (iframe.contentWindow || iframe.contentDocument);
            // add fragments to slide for figure transitions
            var transitions_settings = parseInt(element.getAttribute('data-transitions'), 10),
                transitions_file = !(fig._transitions) ? 0 : fig._transitions.length,
                transitions = isNaN(transitions_settings) ? transitions_file : transitions_settings;
            if(transitions) {
                var fragments = d3.select(slide)
                    .selectAll('.fragment.fig-transition')
                    .data((new Array(transitions)));
                fragments.enter().append('span').attr('class', 'fragment fig-transition');
                // set transition state
                fig._transition_state = 0;
            }
            // add custom event listener to propatage key presses
            fig.addEventListener('keydown', function(e) {
                var event = new CustomEvent('iframe-keydown', { detail: e });
                window.parent.document.dispatchEvent(event)
            });
        };
    }

    Reveal.addEventListener('ready', function( event ) {        
        // Get all figure containers
        var elements = document.querySelector('div.slides').querySelectorAll('.fig-container');
        for (var j = 0; j < elements.length; j++ ) {
            // get id and file attributes
            var id = elements[j].getAttribute('data-fig-id'),
                file = elements[j].getAttribute('data-file');
            // load figure
            initialize(elements[j], id, file);
        }
    });

    // propagate keydown when focus is on iframe
    // https://stackoverflow.com/a/41361761/2503795
    window.document.addEventListener('iframe-keydown',
        (event) => Reveal.triggerKey(event.detail.keyCode), false);

    // figure transitions on fragment change
    Reveal.addEventListener('fragmentshown', function(event) {
        // only proceed if fragment has `fig-transition` class
        if(!event.fragment.className.includes('fig-transition')) return;
        // forward transition
        var slide = event.fragment.closest('section'),
            idx = Reveal.getIndices(slide),
            iframe = slide.querySelector('iframe') ||
                Reveal.getSlideBackground(idx.h, idx.v).querySelector('iframe'),
            fig = (iframe.contentWindow || iframe.contentDocument);
        fig._transitions[fig._transition_state]();
        fig._transition_state = fig._transition_state + 1;
    });

    // figure inverse transitions on fragment change
    Reveal.addEventListener('fragmenthidden', function(event) {
        // only proceed if fragment has `fig-transition` class
        if(!event.fragment.className.includes('fig-transition')) return;
        // backward transition
        var slide = event.fragment.closest('section'),
            idx = Reveal.getIndices(slide),
            iframe = slide.querySelector('iframe') ||
                Reveal.getSlideBackground(idx.h, idx.v).querySelector('iframe'),
            fig = (iframe.contentWindow || iframe.contentDocument);
        fig._transition_state = fig._transition_state - 1;
        (fig._inverse_transitions[fig._transition_state] || Function)();
    });

})();
