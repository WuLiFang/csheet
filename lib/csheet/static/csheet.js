// TODO: button image loop
let count = 0;
let isClient = false;
let videoHeight = 200;
let updateQueueName = 'autoRefresh';
let isHovering;
let workerCount = 0;
let workerNumber = 20;
let lastRefreshTime;
$(document).ready(
    function() {
        let $videos = $('.lightbox video');
        let $smallVideos = $videos.filter('.small');
        let isAutoRefresh = false;

        $smallVideos.appear();
        $('html').dblclick(
            function() {
                $smallVideos.filter(':appeared').each(
                    function() {
                        if (!this.readyState) {
                            loadResource(this, '.small');
                        } else {
                            this.play();
                        }
                    }
                );
            }
        );
        // Soure manage.
        $smallVideos.mouseenter(
            function() {
                if (!this.readyState) {
                    loadResource(this, '.small');
                }
            }
        );
        $smallVideos.on('disappear',
            function() {
                unloadResource(this, '.small');
            }
        );
        $smallVideos.on('appear',
            function() {
                $(getLightbox(this)).find('video').each(
                    function() {
                        let video = this;
                        if (!$(this).data('isScheduled')) {
                            putUpdateQueue(this, true,
                                function() {
                                    $(video).data('isScheduled', false);
                                }
                            );
                            $(video).data('isScheduled', true);
                        }
                    }
                );
                startUpdateWorker();
            }
        );
        $('.lightbox a.zoom').click(
            function() {
                loadResource(this, '.full');
                $smallVideos.each(
                    function() {
                        this.pause();
                    }
                );
            }
        );
        if (isClient) {
            // Refresh button.
            $('.viewer').append(
                $('<button>', {
                    class: 'refresh',
                    click: function() {
                        loadResource(this, '.full', true);
                    },
                })
            );
            // Controls.
            $('#control').removeClass('hidden');
            let captions = $('.lightbox a.zoom .caption');
            $('#caption-switch').change(
                function() {
                    if (this.checked) {
                        captions.css({transform: 'none'});
                    } else {
                        captions.css({transform: ''});
                    }
                }
            );
            // Auto refresh button.
            let refreshInterval;
            let buttons = $('.refresh-module')
                .removeClass('hidden').find('button');
            let spans = buttons.find('span');
            $('.images').mouseenter(function() {
                isHovering = true;
            }).mouseleave(function() {
                isHovering = false;
            });
            let onInterval = function() {
                let $appearedViedos = $smallVideos.filter(':appeared');
                if ($(document).queue(updateQueueName).length == 0 &&
                    new Date().getTime() - lastRefreshTime > 5000) {
                    $appearedViedos.each(
                        function() {
                            if (this.paused) {
                                putUpdateQueue(this);
                            }
                        }
                    );
                    startUpdateWorker();
                }
                spans.css({
                    width: workerCount / workerNumber * 100 + '%',
                });
            };
            buttons.click(
                function() {
                    if (!isAutoRefresh) {
                        refreshInterval = setInterval(onInterval, 100);
                        isAutoRefresh = true;
                        buttons.attr('status', 'on');
                    } else {
                        clearInterval(refreshInterval);
                        $(document).clearQueue(updateQueueName);
                        buttons.attr('status', 'off');
                        isAutoRefresh = false;
                    }
                }
            ).trigger('click');
        }
        // Disable next/prev button when not avalieble.
        $('.lightbox .viewer a').click(
            function() {
                let $this = $(this);
                let $lightbox = $(getLightbox(this));
                let href;
                unloadResource(this, '.full');
                switch ($this.attr('class')) {
                    case 'prev':
                        let prev = $lightbox.prev();
                        while (prev.is('.shrink')) {
                            prev = prev.prev();
                        }
                        href = '#' + prev.attr('id');
                        loadResource(prev, '.full');
                        break;
                    case 'next':
                        let next = $lightbox.next();
                        while (next.is('.shrink')) {
                            next = next.next();
                        }
                        href = '#' + next.attr('id');
                        loadResource(next, '.full');
                        break;
                    default:
                        href = $this.attr('href');
                }
                $this.attr('href', href);
                if (href == '#undefined') {
                    return false;
                }
            }
        );
        // Setup drag.
        $('.lightbox').each(
            function() {
                this.draggable = true;
            }
        ).on('dragstart',
            function(ev) {
                let event = ev.originalEvent;
                // let lightbox = getLightbox(this);
                let lightbox = this;
                let dragData = $(lightbox).data('drag');
                let plainData = dragData;
                if (window.location.protocol == 'file:') {
                    plainData =
                        window.location.origin +
                        decodeURI(
                            window.location.pathname.slice(
                                0, window.location.pathname.lastIndexOf('/'))) +
                        '/' +
                        plainData;
                }
                event.dataTransfer.setData('text/plain', plainData);
                event.dataTransfer
                    .setData('text/uri-list',
                        window.location.origin +
                        window.location.pathname +
                        window.location.search +
                        '#' +
                        lightbox.id);
            }
        );
        // Video play controls.
        $smallVideos.on('loadeddata',
            function() {
                this.play();
            }
        );
        $smallVideos.mouseenter(
            function() {
                if (this.readyState > 1) {
                    this.play();
                }
            }
        );
        $smallVideos.mouseleave(
            function() {
                this.pause();
            }
        );
        $('.lightbox video.full').on('loadedmetadata',
            function() {
                this.controls = this.duration > 0.1;
            }
        );
        // simlpe help
        $('nav').append(
            $('<button>', {
                text: '帮助',
                click: function() {
                    $('.help').toggleClass('hidden');
                },
            })
        );

        // show pack progress
        $('button.pack').click(
            function() {
                let progressBar = $('progress.pack');
                let isStarted = false;
                progressBar.removeClass('hidden');
                $(this).addClass('hidden');
                if (typeof (EventSource) != 'undefined') {
                    let source = new EventSource('/pack_progress');
                    source.onmessage = function(event) {
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
                    /**
                     * Update progress bar value without sse.
                     * @argument {element} progressBar progressbar to update.
                     */
                    function updateProgressBar(progressBar) {
                        $.get('/pack_progress', function(progress) {
                            progressBar.val(progress);
                            if (isStarted && progress < 0) {
                                progressBar.addClass('hidden');
                                return;
                            } else if (progress > 0) {
                                isStarted = true;
                            }
                            setTimeout(function() {
                                updateProgressBar(progressBar);
                            }, 100);
                        });
                    }
                    updateProgressBar(progressBar);
                };
            }
        );
        // Setup.
        $('.noscript').remove();
        $('video').removeClass('hidden');
        $smallVideos.each(
            function() {
                if ($(this).is(':appeared')) {
                    putUpdateQueue(this);
                }
                shrinkLightbox(this);
            }
        );
        startUpdateWorker();
    }
);

/**
 * get a light box from element parent.
 * @param {Element} element this element.
 * @return {Element} lightbox element.
 */
function getLightbox(element) {
    let $element = $(element);
    if ($element.is('.lightbox')) {
        return element;
    }
    return $element.parents('.lightbox')[0];
}


/**
 * Reload related video.
 * @param {Element} element element in a lightbox.
 * @param {String} selector element selector.
 */
function loadResource(element, selector) {
    selector = typeof (selector) === 'undefined' ? '*' : selector;
    let $lightbox = $(getLightbox(element));
    let $selected = $lightbox.find(selector);
    $selected.filter('video').each(
        function() {
            updatePoster(this);
            let url = $(this).data('src');
            this.src = url;
            this.load();
        }
    );
    $selected.find('img').each(
        function() {
            let img = this;
            let url = $(this).data('src');
            if (!img.src) {
                img.src = url;
            }
            imageAvailable(
                url,
                function() {
                    img.src = url;
                }
            );
        }
    );
    if (isClient) {
        loadImageInfo(element);
    }
}

/**
 * Load image information
 * @param {element} element in lightbox.
 */
function loadImageInfo(element) {
    let $lightbox = $(getLightbox(element));
    $.get('images/' + $lightbox.data('uuid') + '.info',
        function(data) {
            $lightbox.find('.detail').each(
                function() {
                    this.innerHTML = data;
                }
            );
        }
    );
}

/**
 * Unload related video to display poster.
 * @param {Element} element element in a lightbox.
 * @param {String} selector element selector.
 */
function unloadResource(element, selector) {
    selector = typeof (selector) === 'undefined' ? '*' : selector;
    let $selected = $(getLightbox(element)).find('video').filter(selector);
    $selected.each(
        function() {
            this.controls = false;
            this.removeAttribute('src');
            this.load();
        }
    );
    $selected.find('img').each(
        function() {
            this.removeAttribute('src');
        }
    );
}

/**
 * Update video poster.
 * @param {Element} video video element.
 * @param {Boolean} isReplace force poster to display.
 * @param {Function} onload Callback.
 * @param {Function} onerror Callback.
 */
function updatePoster(video, isReplace, onload, onerror) {
    if (!isClient) {
        loadPoster(video, isReplace, onload, onerror);
        return;
    }
    let isSmall = $(video).is('.small');
    let updatingClass = isSmall ? 'updating-thumb' : 'updating-full';
    let failedClass = isSmall ? 'failed-thumb' : 'failed-full';
    let lightbox = getLightbox(video);
    $(lightbox).removeClass(failedClass).addClass(updatingClass);
    updateData(
        lightbox,
        function() {
            loadPoster(video, isReplace,
                function(img) {
                    $(lightbox).removeClass(updatingClass);
                    if (onload) {
                        onload(img);
                    }
                },
                function() {
                    $(lightbox).addClass(failedClass);
                    if (onerror) {
                        onerror();
                    }
                }
            );
        }
    );
}
/**
 * load video poster.
 * @param {Element} video video element.
 * @param {Boolean} isReplace force poster to display.
 * @param {Function} onload Callback.
 * @param {Function} onerror Callback.
 */
function loadPoster(video, isReplace, onload, onerror) {
    let url = $(video).data('poster');
    let lightbox = getLightbox(video);
    let isSmall = $(video).is('.small');
    if (url) {
        // First run
        if (!video.poster) {
            let img = new Image();
            img.src = url;
            if (img.complete) {
                $(lightbox).data('ratio', img.width / img.height);
                video.poster = url;
                expandLightbox(video);
            }
        }
        // Update run
        imageAvailable(
            url,
            function(img) {
                if (isSmall) {
                    $(lightbox).data('ratio', img.width / img.height);
                }
                expandLightbox(video);
                video.poster = url;
                if (isReplace) {
                    video.removeAttribute('src');
                    video.load();
                }
                if (onload) {
                    onload(img);
                }
            },
            function() {
                if (video.attributes.poster == url) {
                    video.removeAttribute('poster');
                }
                if (isSmall && !video.poster) {
                    shrinkLightbox(video);
                }
                if (onerror) {
                    onerror();
                }
            }
        );
    }
}


/**
 * Shrink lightbox  element then set count.
 * @param {Element} element lightbox to hide.
 */
function shrinkLightbox(element) {
    let $lightbox = $(getLightbox(element));
    if ($lightbox.is('.shrink')) {
        return;
    }
    $lightbox.addClass('shrink');
    $lightbox.width('10px');
    count += 1;
    updateCount();
}

/**
 * Expand element related lightbox.
 * @param {Element} element The root element.
 */
function expandLightbox(element) {
    let $lightbox = $(getLightbox(element));
    $video = $lightbox.find('video.small');
    $lightbox.height(videoHeight);
    $lightbox.width($lightbox.data('ratio') * videoHeight);
    if ($lightbox.is('.shrink')) {
        $lightbox.removeClass('shrink');
        count -= 1;
        updateCount();
    }
}

/**
 * Update count display.
 */
function updateCount() {
    let header = document.getElementsByTagName('header')[0];
    let lightboxes = document.getElementsByClassName('lightbox');
    let total = lightboxes.length;
    header.children[0].innerText = (
        (total - count).toString() + '/' + total.toString()
    );
}

/**
 * Load image in background.
 * @param {String} url image url.
 * @param {Function} onload callback.
 * @param {Function} onerror callback.
 */
function imageAvailable(url, onload, onerror) {
    let temp = new Image;
    temp.onload = function() {
        onload(temp);
    };
    temp.onerror = onerror;
    temp.src = url;
}

/**
 * Use queue to update video poster.
 * @param {element} video Video element to update.
 * @param {Boolean} isSkipLoaded Will skip update loaded poster if ture.
 * @param {Function} onskip Callback.
 */
function putUpdateQueue(video, isSkipLoaded, onskip) {
    $(document).queue(updateQueueName,
        function() {
            if (!(isSkipLoaded && video.poster) &&
                !location.hash.startsWith('#image') &&
                $(video).is(':appeared')) {
                let onFinish = function() {
                    lastRefreshTime = new Date().getTime();
                    workerCount -= 1;
                    startUpdateWorker();
                };
                updatePoster(video, !isHovering, onFinish, onFinish);
                $(getLightbox(video)).find('video.full').each(
                    function() {
                        updatePoster(this, false);
                    }
                );
            } else {
                workerCount -= 1;
                startUpdateWorker();
                if (onskip) {
                    onskip();
                }
            }
        }
    );
}

/** Start run update queue. */
function startUpdateWorker() {
    while (workerCount < workerNumber &&
        $(document).queue(updateQueueName).length > 0) {
        workerCount += 1;
        $(document).dequeue(updateQueueName);
    }
}

/**
 * Get notes data then display.
 * @param {element} element Note element with pipline data.
 */
function getNote(element) {
    let pipeline = $(element).data('pipeline');
    let lightbox = getLightbox(element);
    let $lightbox = $(lightbox);
    let uuid = $lightbox.data('uuid');

    $.get('/images/' + uuid + '.notes/' + pipeline,
        function(data) {
            $lightbox.find('.note-container').each(
                function() {
                    let $data = $(data);
                    let content = $data.find('.note-html p').html();
                    let serverIP = $data.find('.note-html').data('serverIp');
                    $data.find('.note-html').replaceWith(content);
                    $data.find('img').each(
                        function() {
                            this.src = $(this).attr('src').replace('/upload', 'http://' + serverIP + '/upload');
                        }
                    );
                    this.innerHTML = $data.html();
                }
            );
        }
    );
}
/**
 * Update url data.
 * @param {element} lightbox Lightbox to update data.
 * @param {Function} onload Callback.
 */
function updateData(lightbox, onload) {
    let uuid = $(lightbox).data('uuid');
    $.get(
        '/api/image/url',
        {uuid: uuid},
        function(data) {
            $(lightbox).find('video').each(
                function() {
                    let isSmall = $(this).is('.small');
                    $(this).data('poster', isSmall ? data.thumb : data.full);
                    $(this).data('src', data.preview);
                }
            );
            $(lightbox).find('img').each(
                function() {
                    let isSmall = $(this).is('.small');
                    $(this).data('src', isSmall ? data.thumb : data.full);
                }
            );
            if (onload) {
                onload();
            }
        }
    );
}
