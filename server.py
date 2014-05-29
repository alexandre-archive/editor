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

def verify_text(data, lang):

    i = -1
    n = len(data)

    is_tag = False

    last_char = None
    word = ''

    start = None
    end = None

    has_word = lambda: start != None and end != None

    rword = re.compile('[\w-]', re.UNICODE) # a-zA-Z0-9_\-
    reow = re.compile('[ ,.:;!?]', re.UNICODE)
    rtag = re.compile('[a-zA-Z/]')

    words = []

    while i <= n:
        i += 1

        if i > 0 and i == n and end == None:
            end = i

        # We have a word.
        if has_word():
            suggestion = spell_word(word, lang)
            words.append({'start': start, 'end': end, 'word': word, 'error': suggestion != None, 'suggestions': suggestion})
            word = ''
            start = None
            end = None

        if i < n:

            c = data[i]

            if i > 0:
                last_char = c

                if reow.match(c):
                    # Can start with spaces, so we dont have a start yet.
                    if start != None and end == None:
                        end = i

            if not is_tag and c == '<' and (i + 1) < n and rtag.match(data[i + 1]):
                is_tag = True

                if start:
                    end = i

            elif is_tag and c == '>':
                is_tag = False

            elif not is_tag and rword.match(c):

                word += c

                if start == None:
                    start = i

    return words

@route('/api/processText', method='POST')
def process_text():

    jsonData = request.json

    text = jsonData['text']
    text = parser.unescape(text)
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
    try:
        import socket
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('google.com', 80))
        return s.getsockname()[0]
        #return socket.gethostbyname(socket.gethostname())
    except:
        return '127.0.0.1'

def start_server():
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
