import * as $ from 'jquery';
import './csheet.scss';
import { LightboxManager } from './lightbox';
import { imageAvailable } from './image';

$(document).ready(
    function () {
        // Caption switch.
        let captions = $('.lightbox a.zoom .caption');
        (<JQuery<HTMLInputElement>>$('#caption-switch')).change(
            function () {
                if (this.checked) {
                    captions.css({ transform: 'none' });
                } else {
                    captions.css({ transform: '' });
                }
            }
        );
        // simlpe help
        $('nav').append(
            $('<button>', {
                text: '帮助',
                click: function () {
                    $('.help').toggleClass('hidden');
                },
            })
        );

        // show pack progress
        $('button.pack').click(
            function () {
                let progressBar = <JQuery<HTMLProgressElement>>$('progress.pack');
                let isStarted = false;
                progressBar.removeClass('hidden');
                $(this).addClass('hidden');
                if (typeof (EventSource) != 'undefined') {
                    let source = new EventSource('/pack_progress');
                    source.onmessage = function (event) {
                        if (event.data > 0) {
                            isStarted = true;
                        }
                        progressBar.val(event.data);
                        if (isStarted && event.data < 0) {
                            source.close();
                            progressBar.addClass('hidden');
                        }
                    };
                } else {
                    let isStarted = false;

                    updateProgressBar(progressBar, isStarted);
                };
            }
        );
        // Setup.
        const Manager = new LightboxManager()
        setInterval(() => { Manager.updateAppeared() }, 1000)
        $('.noscript').remove();
        $('#control').removeClass('hidden');
        $('video').removeClass('hidden');
    }
);

/**
 * Update progress bar value without sse.
 * @argument progressBar progressbar to update.
 * @argument isStarted Is progress started.
 */
function updateProgressBar(progressBar: JQuery<HTMLProgressElement>, isStarted: Boolean) {
    $.get('/pack_progress', function (progress) {
        progressBar.val(progress);
        if (isStarted && progress < 0) {
            progressBar.addClass('hidden');
            return;
        } else if (progress > 0) {
            isStarted = true;
        }
        setTimeout(function () {
            updateProgressBar(progressBar, isStarted);
        }, 100);
    });
}