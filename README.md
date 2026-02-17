
# 🛍️ SwiftCart — E-Commerce Website

একটি সম্পূর্ণ Responsive E-Commerce ওয়েবসাইট যা [Fake Store API](https://fakestoreapi.com) ব্যবহার করে তৈরি করা হয়েছে।

---

## 🔗 Live Demo

[SwiftCart Live Site](https://cheerful-stroopwafel-2a5255.netlify.app/)

## 📁 Repository

[GitHub Repository](https://github.com/Monjurul22/SwiftCard)

---

## 🚀 Features

- 🏠 *Home Page* — Hero banner, Why Choose Us section, Trending Products
- 🛒 *Products Page* — সব product দেখা, category filter, product card
- 🔍 *Product Details Modal* — full description, rating, Buy Now / Add to Cart
- 🛍️ *Cart System* — localStorage এ cart data save, navbar এ item count
- 📱 *Fully Responsive* — mobile, tablet, desktop সব device এ কাজ করে

---

## 🛠️ Technologies Used

- HTML5
- CSS3 (TailwindCSS + DaisyUI)
- Vanilla JavaScript (ES6+)
- Fake Store API
- Font Awesome Icons

---


## ❓ JavaScript প্রশ্নোত্তর (বাংলায়)

---

### ১. null এবং undefined এর মধ্যে পার্থক্য কী?

ইচ্ছাকৃতভাবে কোনো ভেরিয়েবল খালি রাখাকে null বলে।

কোনো কিছু খুঁজে না পাওয়াকে undefined বলে।

let name = null;       // ইচ্ছা করে খালি রাখা হয়েছে
let age;
console.log(age);      // undefined — কোনো value দেওয়া হয়নি

---

### ২. map() ফাংশন কীভাবে কাজ করে? forEach() এর সাথে পার্থক্য কী?

map() ফাংশনটি একটি array কে নতুন array তে রূপান্তর করে।

forEach() ফাংশনটি array এর প্রতিটি উপাদানের উপর ফাংশন execute করে। কিন্তু কোনো কিছু return করে না।

const numbers = [1, 2, 3];

// map() — নতুন array তৈরি করে
const doubled = numbers.map(num => num * 2);
console.log(doubled); // [2, 4, 6]

// forEach() — শুধু কাজ করে, কিছু return করে না
numbers.forEach(num => console.log(num)); // 1, 2, 3

---

### ৩. == এবং === এর মধ্যে পার্থক্য কী?

== শুধুমাত্র value তুলনা করে।

=== data type এবং value উভয়ই তুলনা করে।

console.log(5 == "5");  // true  — শুধু value দেখে
console.log(5 === "5"); // false — type আলাদা তাই false

---

### ৪. API data fetch করার সময় async`/await` এর গুরুত্ব কী?

API থেকে data আনতে কিছুটা সময় লাগে। এই সময়ে যদি বাকি সব কাজ থেমে থাকে তাহলে website slow হয়ে যায়।

async`/await` ব্যবহার করলে data আসার অপেক্ষায় থাকার সময়ও website এর বাকি অংশ ঠিকঠাক কাজ করতে পারে।

- async লিখলে বোঝায় এই function টি কিছু সময় নেবে।
- await লিখলে বোঝায় এখানে একটু অপেক্ষা করো, তারপর পরের কাজে যাও।

async function loadProducts() {
    const response = await fetch('https://fakestoreapi.com/products');
    const data = await response.json();
    console.log(data);
}

loadProducts();

এই project এ loadAllProducts(), loadCategories(), showProductDetails() — সবগুলোতেই async`/await` ব্যবহার করা হয়েছে।

---

### ৫. JavaScript এ Scope এর ধারণা ব্যাখ্যা করো (Global, Function, Block)

যেখান থেকে ভেরিয়েবল access করা যায় তাকে Scope বলে।

*Global Scope:* function এবং block ছাড়া যেখান থেকে ভেরিয়েবল access করা হয় তাকে Global Scope বলে।

let siteName = "SwiftCart"; // Global — সব জায়গা থেকে access করা যাবে

function show() {
    console.log(siteName); // ✅ access হচ্ছে
}

*Function Scope:* function এর ভেতর থেকে ভেরিয়েবল access করা হলে তাকে Function Scope বলে।

function calculate() {
    let total = 500; // শুধু এই function এর ভেতরে আছে
    console.log(total); // ✅ 500
}

console.log(total); // ❌ বাইরে থেকে access হবে না

*Block Scope:* let বা const দিয়ে declare করা ভেরিয়েবল {} block এর ভেতরে access করা হলে তাকে Block Scope বলে।

if (true) {
    let message = "Hello!"; // শুধু এই block এর ভেতরে আছে
    console.log(message);   // ✅ Hello!
}

console.log(message); // ❌ block এর বাইরে access হবে না

---

## 📂 Project Structure

swiftcart/
│
├── index.html        # Home Page
├── products.html     # Products Page
├── app.js            # সব JavaScript Logic
└── README.md        

---

## 👨‍💻 Author

*তোমার নাম এখানে লেখো*
- GitHub: [Monjurul22](https://github.com/Monjurul22)

---

© 2025 SwiftCart. All rights reserved.
fakestoreapi.com
