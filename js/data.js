/* data.js — catálogo Princessware (datos compartidos por todas las páginas) */
(function () {
  const fmt = (n) => '$' + Number(n).toLocaleString('es-AR');

  const CATEGORIES = [
  {
    "id": "sets",
    "name": "Sets Completos",
    "desc": "Baterías listas para tu cocina",
    "img": "assets/set-stacked-island.jpeg"
  },
  {
    "id": "ollas",
    "name": "Ollas & Cacerolas",
    "desc": "Cocción profunda y uniforme",
    "img": "assets/hero-pot-stove.jpeg"
  },
  {
    "id": "sartenes",
    "name": "Sartenes & Asadores",
    "desc": "Dorá y sellá sin pegarse",
    "img": "assets/action-chicken.jpeg"
  },
  {
    "id": "vapor",
    "name": "Cocción al Vapor",
    "desc": "Nutrientes intactos, sin agua",
    "img": "assets/action-veggies-steam.jpeg"
  }
];

  const PRODUCTS = [
  {
    "id": "PW-SET-FAM-18",
    "name": "Set Familiar Princessware",
    "pieces": "18 piezas",
    "cat": "sets",
    "img": "assets/set-two-stacks.jpeg",
    "gallery": [
      "assets/set-two-stacks.jpeg",
      "assets/set-stacked-island.jpeg",
      "assets/life-food-pans.jpeg"
    ],
    "price": 1290000,
    "compare": 1850000,
    "badge": "Más vendido",
    "rating": 4.9,
    "reviews": 213,
    "blurb": "La batería completa para toda la familia. Cociná varios platos a la vez con cocción uniforme y termo-selladora.",
    "desc": "El Set Familiar reúne todo lo que una cocina necesita: ollas de distintos diámetros, cacerolas, sartén asador y vaporera, todo en acero quirúrgico 18/8. Las tapas con cierre termo-sellador cocinan en el jugo natural de los alimentos, sin aceite ni agua, conservando hasta el 98% de los nutrientes.",
    "specs": {
      "material": "Acero quirúrgico 18/8",
      "apto": "Gas, eléctrica, vitrocerámica e inducción",
      "incluye": "8 ollas, 4 tapas, sartén asador y vaporera",
      "garantia": "De por vida"
    }
  },
  {
    "id": "PW-SET-ESE-09",
    "name": "Set Esencial",
    "pieces": "9 piezas",
    "cat": "sets",
    "img": "assets/set-four-black.jpeg",
    "gallery": [
      "assets/set-four-black.jpeg",
      "assets/set-stacked-island.jpeg",
      "assets/hero-pot-stove.jpeg"
    ],
    "price": 790000,
    "compare": 990000,
    "badge": "Oferta",
    "rating": 4.8,
    "reviews": 156,
    "blurb": "Lo indispensable en acero quirúrgico 18/8 para el día a día.",
    "desc": "Pensado para arrancar con lo justo y necesario. El Set Esencial trae las piezas que más vas a usar, apilables para ahorrar espacio, con la misma calidad de acero 18/8 de toda la línea.",
    "specs": {
      "material": "Acero quirúrgico 18/8",
      "apto": "Todas las cocinas, incluida inducción",
      "incluye": "4 ollas, 3 tapas, 1 sartén, 1 vaporera",
      "garantia": "De por vida"
    }
  },
  {
    "id": "PW-SET-DUO-06",
    "name": "Set Dúo Compacto",
    "pieces": "6 piezas",
    "cat": "sets",
    "img": "assets/life-food-pans.jpeg",
    "gallery": [
      "assets/life-food-pans.jpeg",
      "assets/set-two-stacks.jpeg"
    ],
    "price": 560000,
    "compare": null,
    "badge": null,
    "rating": 4.7,
    "reviews": 98,
    "blurb": "Ideal para parejas y espacios chicos. Apilable y práctico.",
    "desc": "El compañero perfecto para departamentos y parejas. Compacto, apilable y completo para el día a día sin ocupar media alacena.",
    "specs": {
      "material": "Acero quirúrgico 18/8",
      "apto": "Todas las cocinas, incluida inducción",
      "incluye": "3 ollas, 2 tapas, 1 sartén",
      "garantia": "De por vida"
    }
  },
  {
    "id": "PW-OLL-PRO-24",
    "name": "Olla Profunda",
    "pieces": "24 cm",
    "cat": "ollas",
    "img": "assets/hero-pot-stove.jpeg",
    "gallery": [
      "assets/hero-pot-stove.jpeg",
      "assets/set-stacked-island.jpeg"
    ],
    "price": 320000,
    "compare": null,
    "badge": null,
    "rating": 4.9,
    "reviews": 74,
    "blurb": "Guisos, caldos y pastas con cierre termo-sellador.",
    "desc": "Gran capacidad para guisos, caldos y pastas. Su cierre termo-sellador mantiene el calor y reduce los tiempos de cocción.",
    "specs": {
      "material": "Acero quirúrgico 18/8",
      "apto": "Todas las cocinas, incluida inducción",
      "incluye": "1 olla 24 cm + tapa",
      "garantia": "De por vida"
    }
  },
  {
    "id": "PW-CAC-TAP-20",
    "name": "Cacerola con Tapa",
    "pieces": "20 cm",
    "cat": "ollas",
    "img": "assets/action-veggies-steam.jpeg",
    "gallery": [
      "assets/action-veggies-steam.jpeg",
      "assets/action-hands-veggies.jpeg"
    ],
    "price": 268000,
    "compare": 330000,
    "badge": null,
    "rating": 4.8,
    "reviews": 61,
    "blurb": "Verduras al vapor en su propio jugo, sin perder color.",
    "desc": "La cacerola de uso diario. Cociná verduras al vapor en su propio jugo, sin agua, para que conserven color, textura y vitaminas.",
    "specs": {
      "material": "Acero quirúrgico 18/8",
      "apto": "Todas las cocinas, incluida inducción",
      "incluye": "1 cacerola 20 cm + tapa",
      "garantia": "De por vida"
    }
  },
  {
    "id": "PW-SAR-ASA-28",
    "name": "Sartén Asador",
    "pieces": "28 cm",
    "cat": "sartenes",
    "img": "assets/action-chicken.jpeg",
    "gallery": [
      "assets/action-chicken.jpeg",
      "assets/hero-pot-stove.jpeg"
    ],
    "price": 245000,
    "compare": null,
    "badge": "Nuevo",
    "rating": 4.9,
    "reviews": 40,
    "blurb": "Sellá carnes y dorá sin aceite gracias a la base de triple capa.",
    "desc": "Base de triple capa para distribución pareja del calor. Sellá carnes y dorá sin que se pegue ni necesite aceite.",
    "specs": {
      "material": "Acero quirúrgico 18/8",
      "apto": "Todas las cocinas, incluida inducción",
      "incluye": "1 sartén asador 28 cm",
      "garantia": "De por vida"
    }
  },
  {
    "id": "PW-BUD-VAP-MU",
    "name": "Budinera Vaporera",
    "pieces": "Multiuso",
    "cat": "vapor",
    "img": "assets/action-hands-veggies.jpeg",
    "gallery": [
      "assets/action-hands-veggies.jpeg",
      "assets/action-veggies-steam.jpeg"
    ],
    "price": 198000,
    "compare": null,
    "badge": null,
    "rating": 4.7,
    "reviews": 33,
    "blurb": "Cociná al vapor en niveles y aprovechá cada hornalla.",
    "desc": "Cociná en varios niveles a la vez y aprovechá una sola hornalla. Ideal para vapor, budines y postres.",
    "specs": {
      "material": "Acero quirúrgico 18/8",
      "apto": "Todas las cocinas, incluida inducción",
      "incluye": "1 budinera + accesorio vaporera",
      "garantia": "De por vida"
    }
  },
  {
    "id": "PW-OLL-FAM-28",
    "name": "Olla Familiar",
    "pieces": "28 cm",
    "cat": "ollas",
    "img": "assets/set-stacked-island.jpeg",
    "gallery": [
      "assets/set-stacked-island.jpeg",
      "assets/set-two-stacks.jpeg"
    ],
    "price": 360000,
    "compare": null,
    "badge": null,
    "rating": 4.9,
    "reviews": 52,
    "blurb": "Gran capacidad para las comidas que reúnen a todos.",
    "desc": "La olla de las juntadas. Gran capacidad para cocinar para muchos sin resignar la cocción pareja del acero 18/8.",
    "specs": {
      "material": "Acero quirúrgico 18/8",
      "apto": "Todas las cocinas, incluida inducción",
      "incluye": "1 olla 28 cm + tapa",
      "garantia": "De por vida"
    }
  }
];

  const BENEFITS = [
  {
    "k": "oil",
    "title": "Sin aceite ni agua",
    "desc": "Cociná en el jugo natural de los alimentos."
  },
  {
    "k": "tox",
    "title": "Cero tóxicos",
    "desc": "Acero quirúrgico 18/8. Sin teflón, sin PFOA."
  },
  {
    "k": "leaf",
    "title": "Conserva nutrientes",
    "desc": "Hasta 98% de vitaminas y minerales."
  },
  {
    "k": "life",
    "title": "Garantía de por vida",
    "desc": "Una inversión que dura para siempre."
  }
];

  const RECIPES = [
  {
    "tag": "Sin aceite",
    "title": "Pollo dorado al natural",
    "desc": "Sellado perfecto sin una gota de aceite, en el sartén asador.",
    "img": "assets/action-chicken.jpeg",
    "time": "35 min",
    "level": "Fácil"
  },
  {
    "tag": "Al vapor",
    "title": "Verduras crocantes al vapor",
    "desc": "Color, textura y nutrientes intactos cocinando en su propio jugo.",
    "img": "assets/action-veggies-steam.jpeg",
    "time": "18 min",
    "level": "Fácil"
  },
  {
    "tag": "Guisos",
    "title": "Guiso de invierno",
    "desc": "Cocción lenta y pareja con cierre termo-sellador.",
    "img": "assets/hero-pot-stove.jpeg",
    "time": "50 min",
    "level": "Media"
  },
  {
    "tag": "Saludable",
    "title": "Salteado de estación",
    "desc": "Un wok improvisado con el sartén de triple capa.",
    "img": "assets/action-hands-veggies.jpeg",
    "time": "20 min",
    "level": "Fácil"
  },
  {
    "tag": "Para compartir",
    "title": "Pastas para toda la mesa",
    "desc": "La olla familiar rinde para las juntadas grandes.",
    "img": "assets/set-stacked-island.jpeg",
    "time": "30 min",
    "level": "Fácil"
  },
  {
    "tag": "Postres",
    "title": "Budín en vaporera",
    "desc": "Húmedo y parejo, aprovechando una sola hornalla.",
    "img": "assets/life-food-pans.jpeg",
    "time": "45 min",
    "level": "Media"
  }
];

  const SETTINGS = {
  "whatsapp": "5491123514663",
  "instagram": "princessware.oficial",
  "freeShip": 400000,
  "headingFont": "Cormorant Garamond",
  "favUpsellText": "Guardaste estas piezas en tus favoritos 🤍. ¿Querés agregar alguna a tu compra a antes de finalizarla?",
  "favUpsellDiscount": 5,
  "shipCABA": 15000,
  "shipProvincias": 22000,
  "shipInterior": 29000,
  "shipExterior": 79000,
  "catalogMode": true
};

  window.PW = { fmt, CATEGORIES, PRODUCTS, BENEFITS, RECIPES, SETTINGS };
})();
