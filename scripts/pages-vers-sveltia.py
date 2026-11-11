# Régénère public/admin/config.yml (Sveltia CMS) à partir de .pages.yml (Pages CMS).
# Usage : python3 scripts/pages-vers-sveltia.py .pages.yml > public/admin/config.yml
import sys, yaml
src = yaml.safe_load(open(sys.argv[1]))
ICONS = {'actualites':'newspaper','avions':'flight','documents':'folder_open','tarifs':'euro','pages':'web','decouvrir':'redeem','formations':'school','club':'info','historique':'history_edu','outils':'build','membre':'lock','simulateur':'calculate'}
import re
OVR = {'documents':('Documents membres','PDF, liens et vidéos de l’espace membre'),'outils':('Outils membres','Liens de préparation des vols'),'membre':('Textes espace membre','Avertissements, liens du club et parcours élève')}
def lab(c):
    if c['name'] in OVR: return OVR[c['name']]
    l = re.sub(r'^[^\wÀ-ÿ]+', '', c['label']).strip()
    if ' : ' in l:
        a, b = l.split(' : ', 1); return a, b[0].upper()+b[1:]
    return l, None
MEDIA = {'actualites':'actualites','avions':'avions','documents':'membre','historique':'historique','outils':'outils'}

def field(f):
    t = f.get('type','string'); o = {'name': f['name'], 'label': f.get('label', f['name'])}
    lst = f.get('list', False)
    if t in ('string',): o['widget'] = 'string'
    elif t == 'text': o['widget'] = 'text'
    elif t == 'rich-text': o['widget'] = 'richtext'
    elif t == 'number': o['widget'] = 'number'; o['value_type'] = 'float'
    elif t == 'boolean': o['widget'] = 'boolean'
    elif t == 'date': o.update(widget='datetime', format='YYYY-MM-DD', time_format=False)
    elif t in ('image','file'):
        o['widget'] = t
        if lst: o['multiple'] = True; lst = False
    elif t == 'select':
        opts = f['options']; o['widget'] = 'select'
        o['options'] = [v for v in opts['values'] if v != '']
        if opts.get('multiple'): o['multiple'] = True
    elif t == 'object':
        sub = [field(x) for x in f['fields']]
        if lst: o.update(widget='list', fields=sub); lst = False
        else: o.update(widget='object', fields=sub)
    else: raise SystemExit('type inconnu '+t)
    if lst:  # liste de textes simples
        o = {'name': o['name'], 'label': o['label'], 'widget': 'list'}
    o['required'] = bool(f.get('required', False))
    if 'description' in f: o['hint'] = f['description']
    if 'default' in f: o['default'] = f['default']
    if t == 'boolean' and 'default' not in f: o['default'] = False
    return o

cols, singles = [], []
for c in src['content']:
    m = MEDIA.get(c['name'])
    if c['type'] == 'collection':
        fmt = c.get('format')
        o = {'name': c['name'], 'label': lab(c)[0], 'description': lab(c)[1], 'icon': ICONS[c['name']], 'label_singular': None, 'folder': c['path'], 'create': True}
        if c['name'] == 'actualites':
            o.update(extension='md', format='frontmatter', slug='{{year}}-{{month}}-{{day}}-{{slug}}', label_singular='Actualité',
                     sortable_fields={'fields':['date','titre'],'default':{'field':'date','direction':'descending'}},
                     summary='{{titre}} · {{date | date(\'DD/MM/YYYY\')}}', preview_path='actualites/{{slug}}')
        else:
            o.update(extension='yml', format='yaml', slug='{{slug}}')
        o['identifier_field'] = c['view']['primary']
        if c['name'] == 'avions': o['label_singular'] = 'Avion'; o['sortable_fields'] = ['ordre','nom']
        if c['name'] == 'documents': o['label_singular'] = 'Document'
        o = {k:v for k,v in o.items() if v is not None}
        if m: o['media_folder'] = f'/public/uploads/{m}'; o['public_folder'] = f'/uploads/{m}'
        o['fields'] = [field(x) for x in c['fields']]
        cols.append(o)
    else:
        o = {'name': c['name'], 'label': lab(c)[0], 'icon': ICONS[c['name']], 'file': c['path'], 'format': 'json'}
        o = {k:v for k,v in o.items() if v is not None}
        if m: o['media_folder'] = f'/public/uploads/{m}'; o['public_folder'] = f'/uploads/{m}'
        o['fields'] = [field(x) for x in c['fields']]
        singles.append(o)

conf = {
  'backend': {'name':'github','repo':'hugoflying/acbt','branch':'main','auth_methods':['token'],
              'commit_messages':{'create':'Ajout : {{collection}} « {{slug}} » (back-office)','update':'Modification : {{collection}} « {{slug}} » (back-office)','delete':'Suppression : {{collection}} « {{slug}} » (back-office)','uploadMedia':'Ajout du fichier {{path}} (back-office)','deleteMedia':'Suppression du fichier {{path}} (back-office)'}},
  'app_title': 'Back-office ACBT',
  'logo': {'src': '/acbt/uploads/logo/logo-acbt.png'},
  'site_url': 'https://hugoflying.github.io/acbt',
  'media_folder': 'public/uploads', 'public_folder': '/uploads',
  'output': {'omit_empty_optional_fields': False},
  'collections': cols, 'singletons': singles,
}
head = "# Back-office Sveltia CMS (essai, en parallèle de Pages CMS).\n# Fichier généré à partir de .pages.yml : garder les deux en phase.\n# Ouvrir https://hugoflying.github.io/acbt/admin/\n"
sys.stdout.write(head + yaml.safe_dump(conf, allow_unicode=True, sort_keys=False, width=200))
