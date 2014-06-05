#!/usr/bin/env python
# -*- coding: utf-8 -*-

import errno
import logging
import re
import sys

from bottle import BaseRequest, route, run, response, request, static_file, redirect
from json import dumps
from socket import error as socket_error
from spell import load_lang_modules, lang_modules, support_lang, check as spell_word, add_word

from HTMLParser import HTMLParser

parser = HTMLParser()


TAGS = '(?P<tag><(/)?(a|abbr|acronym|address|applet|area|article|aside|audio|'\
       'b|base|basefont|bdi|bdo|big|blockquote|body|br|button|'\
       'canvas|caption|center|cite|code|col|colgroup|datalist|dd|'\
       'del|details|dfn|dialog|dir|div|dl|dt|em|embed|fieldset|'\
       'figcaption|figure|font|footer|form|frame|frameset|head|'\
       'header|h[123456]|hr|html|i|iframe|img|input|ins|kbd|keygen|'\
       'label|legend|li|link|main|map|mark|menu|menuitem|meta|meter|'\
       'nav|noframes|noscript|object|ol|optgroup|option|output|p|'\
       'param|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|'\
       'small|source|span|strike|strong|style|sub|summary|sup|table|'\
       'tbody|td|textarea|tfoot|th|thead|time|title|tr|track|tt|u|'\
       'ul|var|video|wbr|!--|--|!DOCTYPE)(\s*[a-zA-Z]+=[\'"].*[\'"]\s*)*>)'

def verify_text(data, lang):
    ''' Check the words in the given text to find wrond words. '''
    text = data

    it_tags = re.finditer(TAGS, text)
    it_words = re.finditer('(?P<word>([a-zA-Z]+(-[a-zA-Z]+)*))', text, re.UNICODE)
    #it_phrases = re.finditer('(?P<phrase>((\s*[a-zA-Z]+(-[a-zA-Z]+)*\s*)*))', text, re.UNICODE)

    tags = []
    words = []

    for i in it_tags:
        w = i.group('tag')
        if w:
            tags.append({'start' : i.start(), 'end' : i.end(), 'word' : w})

    f = lambda x, y: len([t for t in tags if x > t['start'] and y < t['end']])

    for i in it_words:
        w = i.group('word')
        wu = parser.unescape(w)
        suggestion = spell_word(wu, lang)
        s = i.start()
        e = i.end()

        if w and not f(s, e):
            words.append({'start' : s, 'end' : e, 'word' : w, 'error': suggestion != None, 'suggestions': suggestion})

    #for i in it_phrases:
    #    w = i.group('phrase')
    #    if w:
    #        print({'start' : i.start(), 'end' : i.end(), 'word' : w})

    return words

@route('/api/processText', method='POST')
def process_text():

    jsonData = request.json

    text = jsonData['text']
    #text = parser.unescape(text)
    text = text.encode('cp1252')

    if not text:
        return dumps(text.decode('cp1252'))

    lng = jsonData['lang']

    if not support_lang(lng):
        return abort(400, 'Unsupported language "%s".' % lng)

    data = verify_text(text, lng)

    data = reversed([x for x in data if x['error']])

    for er in data:
        sug = r', '.join(er['suggestions']).decode('cp1252').encode('ascii', 'xmlcharrefreplace').encode('cp1252')

        s1 = '<span class="wrong-word"><span class="field" onclick="l($(this))">'

        lis = ''

        if sug:
            words = [x.strip() for x in sug.split(',')]
            for w in words:
                lis = lis + '<li onclick="f($(this));">%s</li>' % w

        s2 = '''</span><ul class="list" contenteditable="false">
                        <li onclick="ignore($(this));">Ignore this word</li>
                        <li onclick="add($(this), \'%s\');">Add word to dictionary</li>
                        %s
                       </ul></span><span class="clean-wrong-word"></span>&#11;''' % (er['word'], lis)

        text = text[:er['end']] + s2 + text[er['end']:]
        text = text[:er['start']] + s1 + text[er['start']:]

    response.content_type = 'application/json'
    return dumps(text.decode('cp1252'))

@route('/')
def index():
    return redirect('/index.html')

@route('/<filename:path>')
def get_file(filename):
    return static_file(filename, '.')

@route('/api/supportedLanguages')
def get_supported_languages():
    response.content_type = 'application/json'
    return dumps([{'country': x['name'], 'language': x['description']} for x in lang_modules])

@route('/api/addword', method='POST')
def addword():
    jsonData = request.json

    word = jsonData['word']
    word = parser.unescape(word)
    word = word.encode('cp1252')

    if not word:
        return

    lng = jsonData['lang']

    if not support_lang(lng):
        return abort(400, 'Unsupported language "%s".' % lng)

    #add_word(lng, word)

def get_host():
    ''' Return the host IP. '''
    try:
        import socket
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('google.com', 80))
        return s.getsockname()[0]
        #return socket.gethostbyname(socket.gethostname())
    except:
        return '127.0.0.1'

def start_server():
    ''' Start ABC Online server. '''
    SIZE_1_MB = 1048576
    BaseRequest.MEMFILE_MAX = SIZE_1_MB

    if len(sys.argv) > 1:
        if sys.argv[1] in ['--debug', '-d']:
            print('Server is running at http://localhost:8081')
            run(host='localhost', port=8081, quiet=False)
        else:
            print('Invalid parameter.')
    else:
        try:
            h = get_host()
            print('Server is running at http://%s:80' % h)
            run(host=h, port=80, quiet=True)
        except socket_error as e:
            if e.errno == errno.EACCES:
                print('Root privileges are required to access port 80.')
            else:
                print(e)
        except Exception as e:
            raise e;

if __name__ == '__main__':
    load_lang_modules()
    start_server()
