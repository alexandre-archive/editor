#!/usr/bin/env python
# -*- coding: utf-8 -*-

import hunspell

dictionaries = {}
lang_modules = [{'name': 'pt-BR', 'description' : 'Português (Brasil)', 'dic': 'lng/VeroptBRV320AOC/pt_BR.dic', 'aff': 'lng/VeroptBRV320AOC/pt_BR.aff', }]

def load_lang_modules():
    ''' Load dictionaries. '''

    for l in lang_modules:
        dictionaries[l['name']] = hunspell.HunSpell(l['dic'], l['aff'])

def check(word, lang):
    ''' Check if a word is OK. If not, try to return some suggesntions. '''

    if dictionaries[lang].spell(word):
        return None

    return dictionaries[lang].suggest(word)

def support_lang(lang):
    return dictionaries.has_key(lang)

def add_word(word, lang):
    dictionaries[lang].add(word)