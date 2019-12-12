import xml.sax
import xml.etree.ElementTree as ET
import subprocess
from pymongo import MongoClient, TEXT
import time


client = MongoClient()
client = MongoClient('localhost', 27017)
db = client['wikipedia']
links = db.links


class WikiXmlHandler(xml.sax.handler.ContentHandler):
    """Content handler for Wiki XML data using SAX"""

    def __init__(self):
        xml.sax.handler.ContentHandler.__init__(self)
        self.currentData = ''
        self.title = ''
        self.pages = {}
        self.links = set()
        self.stop_processing = False
        self.num_pages = 0
        self.redirect = ''
        

    def extract_links(self, content):
        n = len(content)
        i = 0
        while i<n:
            start = content[i:].find('[')
            if start == -1:
                i=n
                break
            start = i+start
            if content[start] == '[' and start+1 < n and content[start+1] == '[':
                start = start+2
                if content[start:start+5] == 'File:' or content[start:i+6] == 'Image:' or content[start:start+9] == 'Category:':
                    end = content[start:].find(']')
                    if end == -1:
                        i = n
                        break
                    i = end+start
                    continue

                end = content[start:].find(']')
                if end == -1:
                    break
                end = start+end
                word = content[start:end]
                i = end+2
                if '|' in word:
                    word = word[:word.find('|')]
                if '#' in word:
                    word = word[:word.find('#')]
                if len(word) > 1:
                    word = word[0].upper() + word[1:]
                self.links.add(word)
            else:
                i = n
                break

    def characters(self, content):
        """Characters between opening and closing tags"""
        if self.currentData == 'title':
            if 'File:' in content or 'Image:' in content or 'Category:' in content or 'Wikipedia:' in content or 'Template:' in content:
                self.stop_processing = True
            else:
                self.title = content

        # if self.currentData == 'redirect':
        #     print('content i',content)
        if self.currentData == 'text':
            if content.find('See also') != -1:
                self.stop_processing = True
            elif content.strip() == '</page>':
                self.stop_processing = False

            if not self.stop_processing:
                # print('Extracting links for', self.title)
                self.extract_links(content)
        


    def startElement(self, name, attrs):
        """Opening tag of element"""
        if name in ('title', 'text'):
            self.currentData = name

        if name == 'redirect':
            self.redirect=attrs['title']

    
    def endElement(self, name):
        """Closing tag of element"""

        self.currentData = ''
        if name == 'page':
            # self.pages[self.title] = self.links
            # print('Saved links for', self.title)
            data = {
                'document': self.title,
                'links': list(self.links)
            }
            if self.redirect != '':
                data['redirect'] = self.redirect
                self.redirect = ''
            self.num_pages += 1

            links.insert_one(data)

            # if len(self.batch_links) <= self.batch_size:
            #     self.batch_links.append(data)
            # else:
            #     links.insert_many(self.batch_links)
            #     self.batch_links = []

            self.links = set()
            self.stop_processing = False


# data_path = 'files/enwiki-20190820-pages-articles-multistream1.xml-p10p30302.bz2'

data_path = 'enwiki-20191101-pages-articles-multistream.xml.bz2'


# Object for handling xml
handler = WikiXmlHandler()
# Parsing object
parser = xml.sax.make_parser()
parser.setContentHandler(handler)
# Iteratively process file

t0 = time.time()
for line in subprocess.Popen(['bzcat'],
                             stdin=open(data_path),
                             stdout=subprocess.PIPE).stdout:
    parser.feed(line)

    # if len(handler.pages) > 100:
    #     break

print('Creating indexes')
print(links.create_index('document'))
print('Creating text index...')
links.create_index([('document', TEXT)], default_language='english')

t1 = time.time()
total = t1-t0
print('Inserted all records in', total, 'seconds')
