
function func(o, callback) {
    var parent = o.parent().parent()
    var ul = parent.children('ul');
    var span = parent.children('span');

    if (callback) {
        callback();
    }

    ul.fadeOut(1);

    ul.remove();
    span.attr('onclick','').unbind('click');
    span.removeClass('field');
    parent.removeClass('wrong-word');
}

function f(o){
    func(o, function () {
        var value = o.html();
        o.parent().parent().children('span').text(value);
    });
}

function ignore(o){
    func(o);
}

function add(o, word){
    func(o, function () {
        addword(word);
    });
}

function l(o) {
    var ul = o.parent().children('ul');
    ul.fadeIn(5);

    $(document).keyup(function(event) {
        if(event.keyCode == 27) {
            ul.fadeOut(400);
        }
    });
    
    ul.hover(function(){ }, function() {
        ul.fadeOut(400);
    });
}

function addword(s) {
    var html = JSON.stringify({ word: s, lang: 'pt-BR' });

    console.log(html);
    $.ajax({
        async: false,
        type: "POST",
        url: "/api/addword",
        data: html,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(data) {
            
        },
        error: function (xhr, textStatus, errorThrown) {
            alert('Error: ' + errorThrown.message);
        },
    });
}