// src/api/mockData.js — DELETE once backend is connected

export const MOCK_USERS = [
  { id:'1', name:'Admin User',  email:'admin@eduvault.com', password:'admin123', role:'admin',   avatar:null, joined:'2024-01-15', status:'active', enrolledCourses:[] },
  { id:'2', name:'Jane Smith',  email:'jane@example.com',   password:'pass123',  role:'student', avatar:null, joined:'2024-03-20', status:'active', enrolledCourses:['1','3'] },
  { id:'3', name:'Mark Chen',   email:'mark@example.com',   password:'pass123',  role:'student', avatar:null, joined:'2024-05-10', status:'active', enrolledCourses:['2'] },
  { id:'4', name:'Sofia Reyes', email:'sofia@example.com',  password:'pass123',  role:'student', avatar:null, joined:'2024-08-02', status:'active', enrolledCourses:['4'] },
  { id:'5', name:'Tom Reid',    email:'tom@example.com',    password:'pass123',  role:'student', avatar:null, joined:'2024-09-14', status:'suspended', enrolledCourses:[] },
];

export const MOCK_PRODUCTS = [
  {
    id:'1', type:'course', title:'Complete React Developer 2024', slug:'complete-react-developer',
    author:'Alex Rivera', price:89, originalPrice:149, category:'Development',
    rating:4.8, reviewCount:2841, students:12400,
    image:'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&q=80',
    color:'#1565C0',
    description:'Master React from zero to expert with hooks, context, Redux, React Query, and more.',
    level:'Beginner to Advanced', duration:'42 hours', lessons:310,
    tags:['React','JavaScript','Frontend'], lastUpdated:'2024-11-01', bestseller:true, featured:true,
  },
  {
    id:'2', type:'course', title:'UI/UX Design Fundamentals', slug:'ui-ux-design-fundamentals',
    author:'Sara Kim', price:69, originalPrice:129, category:'Design',
    rating:4.7, reviewCount:1560, students:8900,
    image:'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80',
    color:'#7B1FA2',
    description:'Design beautiful interfaces with Figma, master design systems and user research.',
    level:'Beginner', duration:'28 hours', lessons:198,
    tags:['Figma','Design','UX'], lastUpdated:'2024-10-15', bestseller:false, featured:true,
  },
  {
    id:'3', type:'ebook', title:'The Future of AI in Business', slug:'future-of-ai-business',
    author:'Dr. James Park', price:24, originalPrice:45, category:'Business',
    rating:4.9, reviewCount:432, students:3200,
    image:'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80',
    color:'#00695C',
    description:'Practical frameworks for business leaders to leverage AI for competitive advantage.',
    pages:284, format:'PDF + ePub', tags:['AI','Strategy','Leadership'],
    lastUpdated:'2024-09-20', bestseller:true, featured:false,
  },
  {
    id:'4', type:'course', title:'Python for Data Science', slug:'python-data-science',
    author:'Maria Torres', price:79, originalPrice:139, category:'Data Science',
    rating:4.6, reviewCount:3120, students:15600,
    image:'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&q=80',
    color:'#1565C0',
    description:'Learn Python, Pandas, NumPy, Matplotlib and an intro to machine learning.',
    level:'Intermediate', duration:'36 hours', lessons:275,
    tags:['Python','Data Science','ML'], lastUpdated:'2024-12-01', bestseller:false, featured:true,
  },
  {
    id:'5', type:'ebook', title:'Startup Secrets: 0 to $1M', slug:'startup-secrets',
    author:'Ben Wallace', price:19, originalPrice:39, category:'Business',
    rating:4.5, reviewCount:891, students:5800,
    image:'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&q=80',
    color:'#E65100',
    description:'Real frameworks and tactics from successful founders to reach your first $1M.',
    pages:196, format:'PDF + ePub + Kindle', tags:['Startup','Entrepreneurship','Growth'],
    lastUpdated:'2024-08-10', bestseller:false, featured:false,
  },
  {
    id:'6', type:'course', title:'Advanced TypeScript Patterns', slug:'advanced-typescript',
    author:'Dev Masters', price:99, originalPrice:189, category:'Development',
    rating:4.9, reviewCount:987, students:6700,
    image:'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=600&q=80',
    color:'#0277BD',
    description:'Deep dive into TypeScript generics, conditional types, and advanced design patterns.',
    level:'Advanced', duration:'24 hours', lessons:180,
    tags:['TypeScript','JavaScript','Advanced'], lastUpdated:'2024-11-20', bestseller:true, featured:true,
  },
  {
    id:'7', type:'ebook', title:'Mastering Remote Work', slug:'mastering-remote-work',
    author:'Claire Dubois', price:14, originalPrice:29, category:'Productivity',
    rating:4.4, reviewCount:674, students:4100,
    image:'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80',
    color:'#558B2F',
    description:'Build systems, habits, and boundaries that make remote work sustainable.',
    pages:148, format:'PDF + ePub', tags:['Remote','Productivity','Work'],
    lastUpdated:'2024-07-05', bestseller:false, featured:false,
  },
  {
    id:'8', type:'course', title:'Full-Stack Node.js & PostgreSQL', slug:'fullstack-nodejs-postgres',
    author:'Kevin Osei', price:94, originalPrice:179, category:'Development',
    rating:4.8, reviewCount:1230, students:9800,
    image:'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80',
    color:'#1B5E20',
    description:'Build scalable REST APIs with Node.js, Express, and PostgreSQL — auth and deployment included.',
    level:'Intermediate', duration:'38 hours', lessons:290,
    tags:['Node.js','PostgreSQL','Backend'], lastUpdated:'2024-12-05', bestseller:false, featured:true,
  },
  {
    id:'9', type:'course', title:'Digital Marketing Masterclass', slug:'digital-marketing-masterclass',
    author:'Priya Sharma', price:59, originalPrice:109, category:'Marketing',
    rating:4.6, reviewCount:2100, students:18300,
    image:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
    color:'#AD1457',
    description:'SEO, social ads, email funnels, analytics — the full digital marketing stack.',
    level:'Beginner', duration:'32 hours', lessons:240,
    tags:['Marketing','SEO','Social Media'], lastUpdated:'2024-10-28', bestseller:true, featured:false,
  },
  {
    id:'10', type:'ebook', title:'Zero to One: Product Thinking', slug:'product-thinking',
    author:'Lena Kovač', price:22, originalPrice:44, category:'Business',
    rating:4.7, reviewCount:560, students:2800,
    image:'https://images.unsplash.com/photo-1512758017271-d7b84c2113f1?w=600&q=80',
    color:'#4527A0',
    description:'How great product managers think, decide, and ship products users love.',
    pages:210, format:'PDF + ePub', tags:['Product','Strategy','PM'],
    lastUpdated:'2024-06-12', bestseller:false, featured:false,
  },
];

export const MOCK_ORDERS = [
  { id:'ORD-001', userId:'2', user:'Jane Smith',  email:'jane@example.com',  item:'Complete React Developer 2024',    productId:'1', type:'course', amount:89, status:'completed', date:'2024-12-01' },
  { id:'ORD-002', userId:'3', user:'Mark Chen',   email:'mark@example.com',  item:'The Future of AI in Business',     productId:'3', type:'ebook',  amount:24, status:'completed', date:'2024-12-02' },
  { id:'ORD-003', userId:'4', user:'Sofia Reyes', email:'sofia@example.com', item:'Python for Data Science',          productId:'4', type:'course', amount:79, status:'pending',   date:'2024-12-03' },
  { id:'ORD-004', userId:'5', user:'Tom Reid',    email:'tom@example.com',   item:'Startup Secrets: 0 to $1M',       productId:'5', type:'ebook',  amount:19, status:'completed', date:'2024-12-03' },
  { id:'ORD-005', userId:'6', user:'Amy Johnson', email:'amy@example.com',   item:'UI/UX Design Fundamentals',       productId:'2', type:'course', amount:69, status:'refunded',  date:'2024-12-04' },
  { id:'ORD-006', userId:'2', user:'Jane Smith',  email:'jane@example.com',  item:'Advanced TypeScript Patterns',    productId:'6', type:'course', amount:99, status:'completed', date:'2024-12-05' },
  { id:'ORD-007', userId:'7', user:'Luis Gomez',  email:'luis@example.com',  item:'Full-Stack Node.js & PostgreSQL', productId:'8', type:'course', amount:94, status:'completed', date:'2024-12-06' },
  { id:'ORD-008', userId:'8', user:'Nina Park',   email:'nina@example.com',  item:'Digital Marketing Masterclass',  productId:'9', type:'course', amount:59, status:'pending',   date:'2024-12-07' },
];

export const MOCK_COUPONS = [
  { id:'1', code:'LAUNCH50', discount:50, type:'percent', uses:142, maxUses:500, expires:'2025-06-01', active:true,  createdAt:'2024-10-01' },
  { id:'2', code:'SAVE20',   discount:20, type:'percent', uses:89,  maxUses:200, expires:'2025-03-15', active:true,  createdAt:'2024-11-01' },
  { id:'3', code:'FLAT10',   discount:10, type:'fixed',   uses:34,  maxUses:100, expires:'2025-01-31', active:false, createdAt:'2024-11-15' },
];

export const CATEGORIES = ['All','Development','Design','Business','Data Science','Marketing','Productivity'];

export const REVENUE_BY_MONTH = [
  { month:'Jan', revenue:2400 },{ month:'Feb', revenue:3200 },{ month:'Mar', revenue:2800 },
  { month:'Apr', revenue:4100 },{ month:'May', revenue:3800 },{ month:'Jun', revenue:5200 },
  { month:'Jul', revenue:4800 },{ month:'Aug', revenue:6100 },{ month:'Sep', revenue:5600 },
  { month:'Oct', revenue:7200 },{ month:'Nov', revenue:6800 },{ month:'Dec', revenue:8400 },
];
