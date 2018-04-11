import * as $ from 'jquery';
import './bootstrap.min.css';

$(document).ready(
    function () {
        $('#inputProject').change(function () {
            $.get('/api/project_code/' + $(this).children(':selected').text(),
                function (result) {
                    $('#inputPrefix').val(result + '_EP01_');
                    let inputPrefix = <HTMLInputElement>$('#inputPrefix')[0];
                    inputPrefix.focus();
                    inputPrefix.setSelectionRange(
                        result.length + 3,
                        result.length + 5);
                });
        });
    }
);