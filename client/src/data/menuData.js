export const menuSections = {
  food: [
    {
      section: 'Antipasti',
      items: [
        {
          id: 'f1',
          name: 'Bruschetta al Pomodoro',
          description: 'Toasted sourdough with heirloom tomatoes, fresh basil, sea salt, and extra virgin Ligurian olive oil',
          price: 8.5,
          category: 'food',
        },
      ],
    },
    {
      section: 'Primi Piatti',
      items: [
        {
          id: 'f2',
          name: 'Risotto ai Funghi Porcini',
          description: 'Creamy Carnaroli rice with wild porcini mushrooms, aged Parmigiano Reggiano, and white truffle oil',
          price: 18.0,
          category: 'food',
        },
        {
          id: 'f3',
          name: 'Tagliatelle al Ragù',
          description: 'Hand-rolled egg pasta with a seven-hour slow-cooked Bolognese of veal, pork, and San Marzano tomatoes',
          price: 16.5,
          category: 'food',
        },
      ],
    },
    {
      section: 'Secondi',
      items: [
        {
          id: 'f4',
          name: 'Branzino al Forno',
          description: 'Oven-roasted whole sea bass with Taggiasca olives, capers, cherry tomatoes, and lemon gremolata',
          price: 24.0,
          category: 'food',
        },
        {
          id: 'f5',
          name: 'Bistecca alla Fiorentina',
          description: 'Grilled T-bone Chianina steak, 600g, with rosemary potatoes, grilled seasonal vegetables, and salsa verde',
          price: 38.0,
          category: 'food',
        },
      ],
    },
    {
      section: 'Dolci',
      items: [
        {
          id: 'f6',
          name: 'Tiramisù della Casa',
          description: 'Our signature tiramisù — Savoiardi biscuits soaked in espresso, mascarpone cream, and fine cocoa',
          price: 9.0,
          category: 'food',
        },
      ],
    },
  ],
  drink: [
    {
      section: 'Aperitivi',
      items: [
        {
          id: 'd1',
          name: 'Aperol Spritz',
          description: 'Aperol, Prosecco DOC Treviso, a splash of soda, and a fresh orange wheel over ice',
          price: 9.5,
          category: 'drink',
        },
        {
          id: 'd2',
          name: 'Negroni Classico',
          description: 'Campari, Martini Rosso, and London dry gin, stirred ice cold over a single large cube',
          price: 12.0,
          category: 'drink',
        },
        {
          id: 'd6',
          name: 'Limoncello Spritz',
          description: 'House-made Amalfi limoncello, Prosecco, soda water, and a wide twist of Sicilian lemon zest',
          price: 10.5,
          category: 'drink',
        },
      ],
    },
    {
      section: 'Acque Minerali',
      items: [
        {
          id: 'd3',
          name: 'Acqua Panna 750ml',
          description: 'Still mineral water sourced from the Apennine mountains of Tuscany',
          price: 4.5,
          category: 'drink',
        },
        {
          id: 'd4',
          name: 'San Pellegrino 750ml',
          description: 'Naturally sparkling mineral water from the Italian Alps',
          price: 4.5,
          category: 'drink',
        },
      ],
    },
    {
      section: 'Vini al Calice',
      items: [
        {
          id: 'd5',
          name: 'Chianti Classico DOCG',
          description: 'Glass of medium-bodied Chianti from the Gallo Nero zone — cherry, tobacco, and earthy finish',
          price: 8.0,
          category: 'drink',
        },
      ],
    },
  ],
}

// Flat list for the cart / order emission
export const allItems = [
  ...menuSections.food.flatMap(s => s.items),
  ...menuSections.drink.flatMap(s => s.items),
]
