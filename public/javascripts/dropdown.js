var html = $('html');

$('.dropdown').on("click", function (e) {
    e.preventDefault();
    $(this).toggleClass('is-open');
});

$('.dropdown [data-dropdown-value]').on("click", function (e) {
    e.preventDefault();
    var item = $(this);
    var dropdown = item.parents('.dropdown');
    dropdown.find('.dropdown--input').val(item.data('dropdown-value'));
    dropdown.find('.dropdown--current').text(item.text());
});