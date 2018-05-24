import * as $ from 'jquery';

$(document).ready(
    function() {
        $('#inputProject').change(function(this: any) {
            $.get('/api/project_code/' + $(this).children(':selected').text(),
                function(result: any) {
                    $('#inputPrefix').val(result + '_EP01_');
                    const inputPrefix = $('#inputPrefix')[0] as HTMLInputElement;
                    inputPrefix.focus();
                    inputPrefix.setSelectionRange(
                        result.length + 3,
                        result.length + 5);
                });
        });
        const button = $('#open') as JQuery<HTMLButtonElement>;
        $('form').submit(
            function() {
                button.each(
                    function() {
                        this.disabled = true;
                    },
                );
                let count = 0;
                function updateText() {
                    const dotAmount = (count + 2) % 3 + 1;
                    let message = '正在生成';
                    for (let i = 0; i < dotAmount; i++) {
                        message += '.';
                    }
                    button.html(message);
                    count += 1;
                }
                updateText();
                setInterval(updateText, 500);
            },
        );
    },
);
