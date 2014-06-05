var editor,
    editorDoc,
    editorBody,
    codeMode;

function initDoc() {

    editor = document.getElementById("document");
    editorDoc = editor.contentWindow.document;
    editorBody = editorDoc.body;

    codeMode = false;

    if ('spellcheck' in editorBody) {
        editorBody.spellcheck = false;
    }

    if ('contentEditable' in editorBody) {
        editorBody.contentEditable = true;
    }

    if ('designMode' in editorDoc) {
        editorDoc.designMode = 'On';
    }

    editorBody.className += ' no-overflow ';

    editorDoc.execCommand('styleWithCSS', false, true);
}

function formatDoc(command, value) {

    console.log(command +': '+ value);

    if (validateMode()) {

        var supported = editorDoc.queryCommandSupported(command);

        if (!supported) {
            alert('Command not available for this browser.');
        } else {
            editorDoc.execCommand(command, false, value);
        }
    }
}

function validateMode() {
    if (!codeMode) {
        return true ;
    }

    alert("Disable \"View Source\".");
    editorBody.focus();

    return false;
}

function setDocMode() {

    codeMode = !codeMode;

    var documentData;

    if (codeMode) {
        documentData = document.createTextNode(editorBody.innerHTML);
        editorBody.innerHTML = "";

        var codePre = document.createElement("pre");

        editorBody.contentEditable = false;
        codePre.id = "sourceText";
        codePre.contentEditable = true;

        var code = document.createElement("code");

        codePre.appendChild(code);
        code.appendChild(documentData);

        editorBody.appendChild(codePre);

        $(document).ready(function() {
          $('code').each(function(i, e) {hljs.highlightBlock(e)});
        });

    } else {

        if (document.all) {
            editorBody.innerHTML = editorBody.innerText;
        } else {
            documentData = document.createRange();
            documentData.selectNodeContents(editorBody.firstChild);
            editorBody.innerHTML = documentData.toString();
        }

        editorBody.contentEditable = true;
    }

    editorBody.focus();
}

function printDoc() {
    if (!validateMode()) {
        return;
    }

    var printWindow = window.open("","_blank","width=450,height=470,left=400,top=100,menubar=yes,toolbar=no,location=no,scrollbars=yes");
    printWindow.document.open();
    printWindow.document.write("<!doctype html><html><head><title>Print<\/title><\/head><body onload=\"print();\">" + editor.innerHTML + "<\/body><\/html>");
    printWindow.document.close();
}


function newFile() {

    if(validateMode() && confirm('Are you sure?')){
        editorBody.innerHTML = "";
    };
}

function resetFile() {
    editorBody.innerHTML = "";
}

function saveFile() {
    var editor = new jsPDF();

    // We'll make our own renderer to skip this editor
    var specialElementHandlers = {
        '#editor': function(element, renderer) {
            return true;
        }
    };

    // All units are in the set measurement for the document
    // This can be changed to "pt" (points), "mm" (Default), "cm", "in"
    editor.fromHTML(editorBody.innerHTML, 15, 15, {
        'width': 170, 
        'elementHandlers': specialElementHandlers
    });

    editor.save('Test.pdf');
}

function formatBlock(mode) {
    if (mode && mode === 'normal') {
        formatDoc('removeFormat');
    } else {
        formatDoc('formatblock', mode);
    }
}

function setHyperlink() {
    var url = prompt('Write the URL here','http:\/\/');

    if(url && url != '' && url !='http://') {
        formatDoc('createlink', url);
    }
}

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

function setImage() {
    var url = prompt('Write the URL here','http:\/\/');

    if(url && url != '' && url !='http://') {

        var name = url.toLowerCase();

        if (name.endsWith('.jpg') ||
            name.endsWith('.jpeg') ||
            name.endsWith('.png') ||
            name.endsWith('.gif') ||
            name.endsWith('.bmp') ||
            name.endsWith('.tif')) {
            formatDoc('insertImage', url);
        } else {
            alert('Invalid file type.');
        }

    }
}

fonts = [
            /* Sans Serif */
            {
                name: "Arial",
                fontfamily: "Arial, 'Helvetica Neue', Helvetica, sans-serif",
            },
            {
                name: "Arial Black",
                fontfamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif",
            },
            {
                name: "Arial Narrow",
                fontfamily: "'Arial Narrow', Arial, sans-serif",
            },
            {
                name: "Arial Rounded MT Bold",
                fontfamily: "'Arial Rounded MT Bold', 'Helvetica Rounded', Arial, sans-serif",
            },
            {
                name: "Avant Garde",
                fontfamily: "'Avant Garde', Avantgarde, 'Century Gothic', CenturyGothic, 'AppleGothic', sans-serif",
            },
            {
                name: "Calibri",
                fontfamily: "Calibri, Candara, Segoe, 'Segoe UI', Optima, Arial, sans-serif",
            },
            {
                name: "Candara",
                fontfamily: "Candara, Calibri, Segoe, 'Segoe UI', Optima, Arial, sans-serif",
            },
            {
                name: "Century Gothic",
                fontfamily: "'Century Gothic', CenturyGothic, AppleGothic, sans-serif",
            },
            {
                name: "Franklin Gothic Medium",
                fontfamily: "'Franklin Gothic Medium', 'Franklin Gothic', 'ITC Franklin Gothic', Arial, sans-serif",
            },
            {
                name: "Futura",
                fontfamily: "Futura, 'Trebuchet MS', Arial, sans-serif",
            },
            {
                name: "Geneva",
                fontfamily: "Geneva, Tahoma, Verdana, sans-serif",
            },
            {
                name: "Gill Sans",
                fontfamily: "'Gill Sans', 'Gill Sans MT', Calibri, sans-serif",
            },
            {
                name: "Helvetica",
                fontfamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            },
            {
                name: "Impact",
                fontfamily: "Impact, Haettenschweiler, 'Franklin Gothic Bold', Charcoal, 'Helvetica Inserat', 'Bitstream Vera Sans Bold', 'Arial Black', sans serif",
            },
            {
                name: "Lucida Grande",
                fontfamily: "'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Geneva, Verdana, sans-serif",
            },
            {
                name: "Optima",
                fontfamily: "Optima, Segoe, 'Segoe UI', Candara, Calibri, Arial, sans-serif",
            },
            {
                name: "Segoe UI",
                fontfamily: "'Segoe UI', Frutiger, 'Frutiger Linotype', 'Dejavu Sans', 'Helvetica Neue', Arial, sans-serif",
            },
            {
                name: "Tahoma",
                fontfamily: "Tahoma, Verdana, Segoe, sans-serif",
            },
            {
                name: "Trebuchet MS",
                fontfamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif",
            },
            {
                name: "Verdana",
                fontfamily: "Verdana, Geneva, sans-serif",
            },
            /* Serif */
            {
                name: "Baskerville",
                fontfamily: "Baskerville, 'Baskerville Old Face', 'Hoefler Text', Garamond, 'Times New Roman', serif",
            },
            {
                name: "Big Caslon",
                fontfamily: "'Big Caslon', 'Book Antiqua', 'Palatino Linotype', Georgia, serif",
            },
            {
                name: "Bodoni MT",
                fontfamily: "'Bodoni MT', Didot, 'Didot LT STD', 'Hoefler Text', Garamond, 'Times New Roman', serif",
            },
            {
                name: "Book Antiqua",
                fontfamily: "'Book Antiqua', Palatino, 'Palatino Linotype', 'Palatino LT STD', Georgia, serif",
            },
            {
                name: "Calisto MT",
                fontfamily: "'Calisto MT', 'Bookman Old Style', Bookman, 'Goudy Old Style', Garamond, 'Hoefler Text', 'Bitstream Charter', Georgia, serif",
            },
            {
                name: "Cambria",
                fontfamily: "Cambria, Georgia, serif",
            },
            {
                name: "Didot",
                fontfamily: "Didot, 'Didot LT STD', 'Hoefler Text', Garamond, 'Times New Roman', serif",
            },
            {
                name: "Garamond",
                fontfamily: "Garamond, Baskerville, 'Baskerville Old Face', 'Hoefler Text', 'Times New Roman', serif",
            },
            {
                name: "Georgia",
                fontfamily: "Georgia, Times, 'Times New Roman', serif",
            },
            {
                name: "Goudy Old Style",
                fontfamily: "'Goudy Old Style', Garamond, 'Big Caslon', 'Times New Roman', serif",
            },
            {
                name: "Hoefler Text",
                fontfamily: "'Hoefler Text', 'Baskerville old face', Garamond, 'Times New Roman', serif",
            },
            {
                name: "Lucida Bright",
                fontfamily: "'Lucida Bright', Georgia, serif",
            },
            {
                name: "Palatino",
                fontfamily: "Palatino, 'Palatino Linotype', 'Palatino LT STD', 'Book Antiqua', Georgia, serif",
            },
            {
                name: "Perpetua",
                fontfamily: "Perpetua, Baskerville, 'Big Caslon', 'Palatino Linotype', Palatino, 'URW Palladio L', 'Nimbus Roman No9 L', serif",
            },
            {
                name: "Rockwell",
                fontfamily: "Rockwell, 'Courier Bold', Courier, Georgia, Times, 'Times New Roman', serif",
            },
            {
                name: "Rockwell Extra Bold",
                fontfamily: "'Rockwell Extra Bold', 'Rockwell Bold', monospace",
            },
            {
                name: "Times New Roman",
                fontfamily: "TimesNewRoman, 'Times New Roman', Times, Baskerville, Georgia, serif",
            },
            /* Monospaced */
            {
                name: "Andale Mono",
                fontfamily: "'Andale Mono', AndaleMono, monospace",
            },
            {
                name: "Consolas",
                fontfamily: "Consolas, monaco, monospace",
            },
            {
                name: "Courier New",
                fontfamily: "'Courier New', Courier, 'Lucida Sans Typewriter', 'Lucida Typewriter', monospace",
            },
            {
                name: "Lucida Console",
                fontfamily: "'Lucida Console', 'Lucida Sans Typewriter', Monaco, 'Bitstream Vera Sans Mono', monospace",
            },
            {
                name: "Lucida Sans Typewriter",
                fontfamily: "'Lucida Sans Typewriter', 'Lucida Console', Monaco, 'Bitstream Vera Sans Mono', monospace",
            },
            {
                name: "Monaco",
                fontfamily: "Monaco, Consolas, 'Lucida Console', monospace",
            },
            /* Fantasy */
            {
                name: "Copperplate",
                fontfamily: "Copperplate, 'Copperplate Gothic Light', fantasy",
            },
            {
                name: "Papyrus",
                fontfamily: "Papyrus, fantasy",
            },
            /* Script */
            {
                name: "Brush Script MT",
                fontfamily: "'Brush Script MT', cursive",
            },
        ];

colors = [
    { name: 'AliceBlue', hex: '#F0F8FF', },
    { name: 'AntiqueWhite', hex: '#FAEBD7', },
    { name: 'Aqua', hex: '#00FFFF', },
    { name: 'Aquamarine', hex: '#7FFFD4', },
    { name: 'Azure', hex: '#F0FFFF', },
    { name: 'Beige', hex: '#F5F5DC', },
    { name: 'Bisque', hex: '#FFE4C4', },
    { name: 'Black', hex: '#000000', },
    { name: 'BlanchedAlmond', hex: '#FFEBCD', },
    { name: 'Blue', hex: '#0000FF', },
    { name: 'BlueViolet', hex: '#8A2BE2', },
    { name: 'Brown', hex: '#A52A2A', },
    { name: 'BurlyWood', hex: '#DEB887', },
    { name: 'CadetBlue', hex: '#5F9EA0', },
    { name: 'Chartreuse', hex: '#7FFF00', },
    { name: 'Chocolate', hex: '#D2691E', },
    { name: 'Coral', hex: '#FF7F50', },
    { name: 'CornflowerBlue', hex: '#6495ED', },
    { name: 'Cornsilk', hex: '#FFF8DC', },
    { name: 'Crimson', hex: '#DC143C', },
    { name: 'Cyan', hex: '#00FFFF', },
    { name: 'DarkBlue', hex: '#00008B', },
    { name: 'DarkCyan', hex: '#008B8B', },
    { name: 'DarkGoldenRod', hex: '#B8860B', },
    { name: 'DarkGray', hex: '#A9A9A9', },
    { name: 'DarkGreen', hex: '#006400', },
    { name: 'DarkKhaki', hex: '#BDB76B', },
    { name: 'DarkMagenta', hex: '#8B008B', },
    { name: 'DarkOliveGreen', hex: '#556B2F', },
    { name: 'DarkOrange', hex: '#FF8C00', },
    { name: 'DarkOrchid', hex: '#9932CC', },
    { name: 'DarkRed', hex: '#8B0000', },
    { name: 'DarkSalmon', hex: '#E9967A', },
    { name: 'DarkSeaGreen', hex: '#8FBC8F', },
    { name: 'DarkSlateBlue', hex: '#483D8B', },
    { name: 'DarkSlateGray', hex: '#2F4F4F', },
    { name: 'DarkTurquoise', hex: '#00CED1', },
    { name: 'DarkViolet', hex: '#9400D3', },
    { name: 'DeepPink', hex: '#FF1493', },
    { name: 'DeepSkyBlue', hex: '#00BFFF', },
    { name: 'DimGray', hex: '#696969', },
    { name: 'DodgerBlue', hex: '#1E90FF', },
    { name: 'FireBrick', hex: '#B22222', },
    { name: 'FloralWhite', hex: '#FFFAF0', },
    { name: 'ForestGreen', hex: '#228B22', },
    { name: 'Fuchsia', hex: '#FF00FF', },
    { name: 'Gainsboro', hex: '#DCDCDC', },
    { name: 'GhostWhite', hex: '#F8F8FF', },
    { name: 'Gold', hex: '#FFD700', },
    { name: 'GoldenRod', hex: '#DAA520', },
    { name: 'Gray', hex: '#808080', },
    { name: 'Green', hex: '#008000', },
    { name: 'GreenYellow', hex: '#ADFF2F', },
    { name: 'HoneyDew', hex: '#F0FFF0', },
    { name: 'HotPink', hex: '#FF69B4', },
    { name: 'IndianRed ', hex: '#CD5C5C', },
    { name: 'Indigo ', hex: '#4B0082', },
    { name: 'Ivory', hex: '#FFFFF0', },
    { name: 'Khaki', hex: '#F0E68C', },
    { name: 'Lavender', hex: '#E6E6FA', },
    { name: 'LavenderBlush', hex: '#FFF0F5', },
    { name: 'LawnGreen', hex: '#7CFC00', },
    { name: 'LemonChiffon', hex: '#FFFACD', },
    { name: 'LightBlue', hex: '#ADD8E6', },
    { name: 'LightCoral', hex: '#F08080', },
    { name: 'LightCyan', hex: '#E0FFFF', },
    { name: 'LightGoldenRodYellow', hex: '#FAFAD2', },
    { name: 'LightGray', hex: '#D3D3D3', },
    { name: 'LightGreen', hex: '#90EE90', },
    { name: 'LightPink', hex: '#FFB6C1', },
    { name: 'LightSalmon', hex: '#FFA07A', },
    { name: 'LightSeaGreen', hex: '#20B2AA', },
    { name: 'LightSkyBlue', hex: '#87CEFA', },
    { name: 'LightSlateGray', hex: '#778899', },
    { name: 'LightSteelBlue', hex: '#B0C4DE', },
    { name: 'LightYellow', hex: '#FFFFE0', },
    { name: 'Lime', hex: '#00FF00', },
    { name: 'LimeGreen', hex: '#32CD32', },
    { name: 'Linen', hex: '#FAF0E6', },
    { name: 'Magenta', hex: '#FF00FF', },
    { name: 'Maroon', hex: '#800000', },
    { name: 'MediumAquaMarine', hex: '#66CDAA', },
    { name: 'MediumBlue', hex: '#0000CD', },
    { name: 'MediumOrchid', hex: '#BA55D3', },
    { name: 'MediumPurple', hex: '#9370DB', },
    { name: 'MediumSeaGreen', hex: '#3CB371', },
    { name: 'MediumSlateBlue', hex: '#7B68EE', },
    { name: 'MediumSpringGreen', hex: '#00FA9A', },
    { name: 'MediumTurquoise', hex: '#48D1CC', },
    { name: 'MediumVioletRed', hex: '#C71585', },
    { name: 'MidnightBlue', hex: '#191970', },
    { name: 'MintCream', hex: '#F5FFFA', },
    { name: 'MistyRose', hex: '#FFE4E1', },
    { name: 'Moccasin', hex: '#FFE4B5', },
    { name: 'NavajoWhite', hex: '#FFDEAD', },
    { name: 'Navy', hex: '#000080', },
    { name: 'OldLace', hex: '#FDF5E6', },
    { name: 'Olive', hex: '#808000', },
    { name: 'OliveDrab', hex: '#6B8E23', },
    { name: 'Orange', hex: '#FFA500', },
    { name: 'OrangeRed', hex: '#FF4500', },
    { name: 'Orchid', hex: '#DA70D6', },
    { name: 'PaleGoldenRod', hex: '#EEE8AA', },
    { name: 'PaleGreen', hex: '#98FB98', },
    { name: 'PaleTurquoise', hex: '#AFEEEE', },
    { name: 'PaleVioletRed', hex: '#DB7093', },
    { name: 'PapayaWhip', hex: '#FFEFD5', },
    { name: 'PeachPuff', hex: '#FFDAB9', },
    { name: 'Peru', hex: '#CD853F', },
    { name: 'Pink', hex: '#FFC0CB', },
    { name: 'Plum', hex: '#DDA0DD', },
    { name: 'PowderBlue', hex: '#B0E0E6', },
    { name: 'Purple', hex: '#800080', },
    { name: 'Red', hex: '#FF0000', },
    { name: 'RosyBrown', hex: '#BC8F8F', },
    { name: 'RoyalBlue', hex: '#4169E1', },
    { name: 'SaddleBrown', hex: '#8B4513', },
    { name: 'Salmon', hex: '#FA8072', },
    { name: 'SandyBrown', hex: '#F4A460', },
    { name: 'SeaGreen', hex: '#2E8B57', },
    { name: 'SeaShell', hex: '#FFF5EE', },
    { name: 'Sienna', hex: '#A0522D', },
    { name: 'Silver', hex: '#C0C0C0', },
    { name: 'SkyBlue', hex: '#87CEEB', },
    { name: 'SlateBlue', hex: '#6A5ACD', },
    { name: 'SlateGray', hex: '#708090', },
    { name: 'Snow', hex: '#FFFAFA', },
    { name: 'SpringGreen', hex: '#00FF7F', },
    { name: 'SteelBlue', hex: '#4682B4', },
    { name: 'Tan', hex: '#D2B48C', },
    { name: 'Teal', hex: '#008080', },
    { name: 'Thistle', hex: '#D8BFD8', },
    { name: 'Tomato', hex: '#FF6347', },
    { name: 'Turquoise', hex: '#40E0D0', },
    { name: 'Violet', hex: '#EE82EE', },
    { name: 'Wheat', hex: '#F5DEB3', },
    { name: 'White', hex: '#FFFFFF', },
    { name: 'WhiteSmoke', hex: '#F5F5F5', },
    { name: 'Yellow', hex: '#FFFF00', },
    { name: 'YellowGreen', hex: '#9ACD32', },
];

function setFont(fontname) {

}

function setFontSize(size) {

}

function setFontForeColor(color) {

}

function setFontBackColor(color) {
    
}

function getFonts() {
    return _.sortBy(fonts, function (item) { return item.name; });
}

function getFont(fontname) {
    return _.findWhere(fonts, { name: fontname }).fontfamily;
}

function getFontSizes() {
    return [6, 8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 26, 28, 36, 48, 72];
}