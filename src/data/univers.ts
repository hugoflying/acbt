// Les « univers » du site : chacun a sa couleur, sa photo et son entrée dans le menu.
export const univers = [
  { id: 'decouvrir', num: '01', titre: 'Découvrir', sousTitre: "Baptêmes de l'air et vols d'initiation", href: '/decouvrir-le-vol', image: '/uploads/avions/dr400-petit-prince-02.jpg', badges: ['Dès 1 passager', 'Bon cadeau'] },
  { id: 'apprendre', num: '02', titre: 'Apprendre', sousTitre: 'BIA, LAPL et PPL avec nos instructeurs', href: '/formations', image: '/uploads/actualites/2022/lache-elisa/01.jpg', badges: ['Dès 13 ans', 'Aides jeunes'] },
  { id: 'voler', num: '03', titre: 'Voler', sousTitre: 'La flotte et les tarifs du club', href: '/club/flotte', image: '/uploads/avions/jodel-d120-02.jpg', badges: ['4 avions', 'Réservation en ligne'] },
  { id: 'club', num: '04', titre: 'Le club', sousTitre: "Notre histoire depuis 1979", href: '/club/historique', image: '/uploads/historique/1979-flotte-de-depart.jpg', badges: ['Depuis 1979', 'Bénévoles'] },
  { id: 'membres', num: '05', titre: 'Espace membre', sousTitre: 'Préparer son vol : météo, NOTAM, documents', href: '/membre', image: '/uploads/avions/dr400-petit-prince-01.jpg', badges: ['Outils VFR', 'Documents'] },
] as const;
