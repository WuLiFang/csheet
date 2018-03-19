$(document).ready(
    function() {
        $('#inputProject').change(function() {
            $.get('/project_code/' + $(this).children(':selected').text(),
                function(result) {
                    $('#inputPrefix').val(result + '_EP01_');
                    let inputPrefix = $('#inputPrefix')[0];
                    inputPrefix.focus();
                    inputPrefix.setSelectionRange(
                        result.length + 3,
                        result.length + 5);
                });
        }
        );
    }
);

