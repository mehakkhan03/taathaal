const PRODUCTS = [
{
  id:1,stock:3,name:'Ronga Muga Mekhela Sador',category:'Mekhela Sador',price:12499,image:'xxtHn.jpeg',craft:'Handwoven Muga-inspired silk',rating:5,reviews:[ {
    name:'Ananya',date:'12 Sep 2026',rating:5,text:'The weave and colour feel beautifully balanced. It looked even better in natural light.'
  }, {
    name:'Mitali',date:'03 Aug 2026',rating:5,text:'A beautiful festive piece with a very graceful drape.'
  }, {
    name:'Riya',date:'22 Jul 2026',rating:5,text:'The Assamese detailing is subtle and elegant.'
  }
  ] ,desc:'A warm ivory ensemble with Assamese floral borders, designed for festive occasions and heirloom wardrobes.'
},
{
  id:2,stock:8,name:'Bhorali Handloom Sador',category:'Mekhela Sador',price:8999,image:'WrMvt.jpeg',craft:'Handcrafted textile',rating:4,reviews:[ {
    name:'Nandita',date:'15 Aug 2026',rating:4,text:'Soft, understated and easy to style for intimate celebrations.'
  }, {
    name:'Juri',date:'01 Jul 2026',rating:4,text:'Loved the contemporary feel while still looking rooted.'
  }
  ],desc:'A softly patterned traditional weave with a contemporary drape and understated festive character.'
},
{
  id:3,stock:14,name:'Luit Crimson Gamusa',category:'Gamusa',price:1299,image:'VhHnN.jpg',craft:'Traditional Assamese weave',rating:5,reviews:[ {
    name:'Arjun',date:'08 Sep 2026',rating:5,text:'Crisp, classic and beautifully finished.'
  }, {
    name:'Meera',date:'11 Jul 2026',rating:5,text:'Bought these as gifts. The finish felt special.'
  }
  ],desc:'A classic white-and-crimson gamusa with bold woven motifs, finished for gifting or everyday cultural wear.'
},
{
  id:4,stock:0,name:'Brahmaputra Pearl Saree',category:'Sarees',price:7499,image:'Z528U.webp',craft:'Handloom-inspired silk',rating:4,reviews:[ {
    name:'Priyanka',date:'29 Aug 2026',rating:4,text:'The neutral base makes the motifs really easy to style.'
  }, {
    name:'Ishita',date:'19 Jun 2026',rating:4,text:'Elegant without feeling overly formal.'
  }
  ],desc:'An ivory saree scattered with jewel-toned motifs and a structured Assamese-inspired border.'
},
{
  id:5,stock:2,name:'Japi Gold Silk Saree',category:'Sarees',price:9999,image:'OMrPW.jpeg',craft:'Hand-finished textile',rating:5,reviews:[ {
    name:'Madhurima',date:'17 Aug 2026',rating:5,text:'The red floral details are gorgeous against the gold.'
  }, {
    name:'Rupali',date:'30 Jun 2026',rating:5,text:'Feels like a modern heirloom.'
  }
  ],desc:'A rich neutral base with red floral details, made to balance traditional motifs with modern styling.'
},
{
  id:6,stock:6,name:'Majuli Indigo Sador',category:'Mekhela Sador',price:11499,image:'mSSni.webp',craft:'Artisan-inspired weave',rating:5,reviews:[ {
    name:'Aditi',date:'05 Sep 2026',rating:5,text:'The indigo and gold combination is striking.'
  }, {
    name:'Bhaswati',date:'14 Jul 2026',rating:5,text:'A statement piece that still feels very wearable.'
  }
  ],desc:'A deep indigo and gold composition inspired by Assam’s visual heritage.'
},
{
  id:7,stock:9,name:'Xewali Silk Saree',category:'Sarees',price:8299,image:'xxtHn.jpeg',craft:'Handloom-inspired',rating:4,reviews:[ {
    name:'Sneha',date:'28 Aug 2026',rating:4,text:'Very graceful and easy to dress up.'
  }
  ],desc:'An elegant ivory drape with a restrained crimson floral border.'
},
{
  id:8,stock:1,name:'Paatgaon Heritage Sador',category:'Mekhela Sador',price:10499,image:'WrMvt.jpeg',craft:'Traditional weave',rating:4,reviews:[ {
    name:'Jahnavi',date:'07 Aug 2026',rating:4,text:'The woven motifs are delicate and beautifully placed.'
  }
  ],desc:'A heritage-inspired textile with delicate multicolour woven motifs.'
},
{
  id:9,stock:20,name:'Bihu Crimson Gamusa',category:'Gamusa',price:999,image:'VhHnN.jpg',craft:'Handwoven cotton',rating:5,reviews:[ {
    name:'Dev',date:'10 Sep 2026',rating:5,text:'A lovely everyday interpretation of the classic red and white.'
  }
  ],desc:'A crisp everyday gamusa celebrating the unmistakable Assamese red-and-white palette.'
},
{
  id:10,stock:4,name:'Muga Dusk Saree',category:'Sarees',price:11999,image:'mSSni.webp',craft:'Muga-inspired silk',rating:5,reviews:[ {
    name:'Moumita',date:'25 Aug 2026',rating:5,text:'Rich, elegant and beautifully understated.'
  }
  ],desc:'A statement neutral silk look with a deep indigo border and woven ornamental details.'
},
{
  id:11,stock:7,name:'Kopou Floral Sador',category:'Mekhela Sador',price:9499,image:'Z528U.webp',craft:'Hand-finished weave',rating:4,reviews:[ {
    name:'Roshni',date:'02 Aug 2026',rating:4,text:'Soft ivory and colour make this very versatile.'
  }
  ],desc:'Soft ivory, scattered colour and a graceful border for intimate celebrations.'
},
{
  id:12,stock:0,name:'Joon Gold Gamusa Stole',category:'Fusion Accessories',price:1599,image:'OMrPW.jpeg',craft:'Textile craft',rating:4,reviews:[ {
    name:'Ira',date:'12 Sep 2026',rating:4,text:'A nice way to bring Assamese textile details into everyday outfits.'
  }
  ],desc:'A contemporary textile accessory inspired by traditional Assamese motifs.'
},
{
  id:13,stock:5,name:'Xorai Edit Clutch',category:'Fusion Accessories',price:2199,image:'WrMvt.jpeg',craft:'Handcrafted textile clutch',rating:4,reviews:[ {
    name:'Sanjana',date:'18 Sep 2026',rating:4,text:'Lovely structure and a thoughtful fusion of textile details with a modern silhouette.'
  }, {
    name:'Ritika',date:'29 Jul 2026',rating:4,text:'Compact but still fits the essentials.'
  }
  ],desc:'A structured occasion clutch that translates Assamese woven patterns into a modern silhouette.'
},
{
  id:14,stock:2,name:'Gamusa Fold Clutch',category:'Fusion Accessories',price:1899,image:'VhHnN.jpg',craft:'Textile fusion',rating:5,reviews:[ {
    name:'Puja',date:'20 Aug 2026',rating:5,text:'The red-and-white story feels festive without looking costume-like.'
  }
  ],desc:'A compact clutch concept pairing a traditional red-and-white textile story with modern styling.'
},
{
  id:15,stock:11,name:'Muga Bloom Potli',category:'Fusion Accessories',price:1699,image:'xxtHn.jpeg',craft:'Handcrafted textile accessory',rating:4,reviews:[ {
    name:'Diya',date:'04 Aug 2026',rating:4,text:'Sweet, light and perfect for festive evenings.'
  }
  ],desc:'A soft potli silhouette inspired by handwoven silk textures.'
},
{
  id:16,stock:3,name:'Indigo Loom Sling',category:'Fusion Accessories',price:2499,image:'mSSni.webp',craft:'Handcrafted textile bag',rating:5,reviews:[ {
    name:'Tanya',date:'31 Aug 2026',rating:5,text:'The indigo colour is gorgeous and the shape feels very current.'
  }
  ],desc:'A relaxed sling interpretation of Assam-inspired indigo and gold weaving.'
},
{
  id:17,stock:16,name:'Bohag Gift Gamusa Set',category:'Gamusa',price:1799,image:'VhHnN.jpg',craft:'Traditional weave',rating:5,reviews:[ {
    name:'Kunal',date:'09 Sep 2026',rating:5,text:'A thoughtful gifting option with a strong sense of place.'
  }
  ],desc:'A curated pair designed for gifting during Bohag Bihu and other celebrations.'
},
{
  id:18,stock:1,name:'Muga Heritage Duo',category:'Sarees',price:13999,image:'OMrPW.jpeg',craft:'Artisan-inspired silk',rating:5,reviews:[ {
    name:'Sohini',date:'27 Aug 2026',rating:5,text:'Classic motifs and a rich handcrafted feel.'
  }
  ],desc:'A premium textile story for collectors who prefer classic motifs and rich handcrafted detail.'
}
];
const CATEGORIES=['All','Mekhela Sador','Sarees','Gamusa','Fusion Accessories'];
