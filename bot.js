// importing the needed libraries:
const { Telegraf, Markup } = require("telegraf");
const sqlite3 = require("sqlite3");

// opening the database:
const db = new sqlite3.Database("./Data/uteacherz.db");

// defining the bot and give it the token:
const token = "6591935311:AAGrX_PgnpqmHpeSYytXGt4cHPpjwc_1e54";
const bot = new Telegraf(token);

// holding the current circumstance of the keyboard and menu:
//   circumstances:
//     main_menu
//     search_menu0
//     search_menu1
//     numpad
let menu = "main_menu";

// keyboard buttons:
const backButton = "◀️ بازگشت";
const searchButton = "🔎 جست و جو";
const UTSocietyButton = "🏛 جامعه ی دانشگاه تهران";
const UTPostsButton = "🗒 مطالب مفید";

// keyboards:
const mainKeyboard = [[searchButton], [UTSocietyButton, UTPostsButton]];

const backKeyboard = [[backButton]];

const numpad = [
  ["7", "8", "9"],
  ["4", "5", "6"],
  ["1", "2", "3"],
  [backButton, "0"], // Spanning 2 columns
];

// start command:
bot.start((ctx) => {
  const options = {
    reply_markup: { keyboard: mainKeyboard, resize_keyboard: true },
    disable_web_page_preview: true,
    parse_mode: "Markdown",
  };
  bot.telegram.sendMessage(
    ctx.chat.id,
    `
  سلام ${ctx.from.first_name != undefined ? ctx.from.first_name : ""} ${
      ctx.from.last_name != undefined ? ctx.from.last_name : ""
    } ☺️
حالت چطوره؟! امیدوارم کیفت کوک باشه! :)
خوشحال میشم اگر توی انتخاب استاد مناسب بتونم بهت کمک کنم. اینجا میتونی نظر دانشجوهای دیگه رو بخونی و یا نظر خودت رو در مورد اساتید ثبت کنی!
اگر هم سوالی داشتی و من نتونستم بهت کمک کنم، سوالت رو حتما توی [گروه دانشگاه تهران](t.me/UTGroups) بپرس. اونجا دانشجوهای دیگه حضور دارن و حتما راهنماییت میکنن 😌
موفق باشی ✌️

برای خوندن راهنمای ربات، دستور /help رو وارد کن :)`,
    options
  );
  menu = "main_menu";
});

// help command:
bot.help((ctx) => {
  const options = {
    reply_markup: { keyboard: mainKeyboard, resize_keyboard: true },
    disable_web_page_preview: true,
    parse_mode: "Markdown",
  };
  bot.telegram.sendMessage(
    ctx.chat.id,
    `🔎 جست و جو 
اگر دنبال استاد خاصی می‌گردی، کافیه دکمه‌ی «🔎 جست و جو» رو فشار بدی و اسم استاد مد نظرت رو وارد کنی. بعدش از بین نتایجِ جست و جو، استاد مورد نظرت رو انتخاب می‌کنی و می‌تونی اطلاعات استاد و یا نظرات دانشجویان در مورد اون استاد رو ببینی. همچنین می‌تونی به اون استاد نمره بدی و یا در موردش نظرت رو ثبت کنی.

🏛 جامعه ی دانشگاه تهران
 با فشار دادن این دکمه، میتونی لیست کاملی از گروه‌ها و کانال‌های مهم دانشگاه تهران رو ببینی... از  [گروه دانشگاه تهران](t.me/UTGroups) گرفته تا  [کانال زایشگاه تهران](t.me/ZayeshgahTehran) و...

🗒 مطالب مفید
از طریق این گزینه می‌تونی به فهرست کاملی از اطلاعات مهم و مطالب آموزشی و تجارب دانشجویان سال‌های گذشته، مثل شرایط کهاد، دووجهی، انتقالی و تغییر رشته و... دسترسی پیدا کنی.`,
    options
  );
  menu = "main_menu";
});

// Searching for a professor:
bot.hears(searchButton, (ctx) => {
  const options = {
    reply_markup: { keyboard: backKeyboard, resize_keyboard: true },
  };
  bot.telegram.sendMessage(ctx.chat.id, `اسم استاد مدنظرت چیه؟!`, options);
  menu = "search_menu0";
});

// Sending an index of the posts of the ut guide channel:
bot.hears(UTPostsButton, (ctx) => {
  const options = {
    reply_markup: { keyboard: mainKeyboard, resize_keyboard: true },
    disable_web_page_preview: true,
    parse_mode: "Markdown",
  };
  bot.telegram.sendMessage(
    ctx.chat.id,
    `
لینک ها:
⭕️ [لیست سامانه های مهم دانشگاه](https://t.me/UT_Guide/16)
⭕️ [کانال های تلگرامی دانلود کتاب دانشگاهی](https://t.me/UT_Guide/65)

دانستنی‌ها:
💡 [کهاد چیه؟](https://t.me/UT_Guide/19)
💡 [دو وجهی چیه؟](https://t.me/UT_Guide/22)
💡 [دو رشته ای چیه؟](https://t.me/UT_Guide/24)
💡[تغییر رشته در مقطع کارشناسی؟](https://t.me/UT_Guide/26)

اندک ترم‌ای‌ها:
🔺 [قسمت اول](https://t.me/UT_Guide/60) (گلستان، ایلرن، کلاس آنلاین)
🔺 [قسمت دوم](https://t.me/UT_Guide/62) (ایمیل دانشگاه، تی ای)
🔺 [قسمت سوم](https://t.me/UT_Guide/66) (معرفی دانشکده ادبیات)
🔺 [قسمت چهارم](https://t.me/UT_Guide/67) (معرفی پردیس فنی)
🔺 [قسمت پنجم](https://t.me/UT_Guide/69) (المپیاد دانشجویی)
🔺 [قسمت ششم](https://t.me/UT_Guide/70) (خوابگاه کارشناسی)
🔺 [قسمت هفتم](https://t.me/UT_Guide/79) (ریاضی یک)
🔺 [قسمت هشتم](https://t.me/UT_Guide/82) (فیزیک یک)
🔺 [قسمت نهم](https://t.me/UT_Guide/83) (خرید کتب دانشگاهی)
🔺 [قسمت دهم](https://t.me/UTCivGuide/108) (ریاضی دو)
🔺 [قسمت یازدهم](https://t.me/UTCivGuide/120) (معادلات دیفرانسیل)
🔺 [قسمت دوازدهم](https://t.me/UTCivGuide/127) (فیزیک دو)

🔶 به درد بخور ها:
🔸 [دفتر تلفن دانشگاه تهران](https://t.me/UT_Guide/33)
🔸 [نرم افزار دانشگاه تهران](https://t.me/UT_Guide/53)
🔸 [نحوه ی ورود به سامانه گلستان](https://t.me/UT_Guide/45)
🔸 [لیست گزارش های مهم سامانه گلستان](https://t.me/UT_Guide/59)
🔸 [توضیح در مورد کارگاه مهارت های زندگی](https://t.me/UT_Guide/77)
🔸 [اطلاعیه کارگاه مهارت های زندگی](https://t.me/UT_Guide/85)
🔸 [اتصال ایمیل دانشگاهی به نرم افزار ایمیل](https://t.me/UT_Guide/76)
🔸 [رفع مشکل میکروفون و وبکم در کلاس آنلاین](https://t.me/UT_Guide/84)
🔸 [نرم افزار های اسکن و ادغام PDF](https://t.me/UT_Guide/36)
  `,
    options
  );
  menu = "main_menu";
});

// Sending the ccomplete list of the ut groups::
bot.hears(UTSocietyButton, (ctx) => {
  const options = {
    reply_markup: { keyboard: mainKeyboard, resize_keyboard: true },
    disable_web_page_preview: true,
    parse_mode: "Markdown",
  };
  bot.telegram.sendMessage(
    ctx.chat.id,
    `
💢 [گروه دانشگاه تهران](t.me/UTGroups)

💡 گروه های رفع اشکال :
🌀 [ریاضیات دانشگاه تهران](https://t.me/fannimath) 
🌀 [فیزیک دانشگاه تهران](https://t.me/fanniphysics) 
🌀 [شیمی دانشگاه تهران](https://t.me/fannichem)
🌀 [برنامه نویسی دانشگاه تهران](https://t.me/ut_Debugger) 
🌀 [رفع اشکال مهندسی برق](https://t.me/EE_Students)

📢 کانال های دانشگاه تهران (همه ی رشته ها) : 
♦️ [راهنمای دانشگاه تهران](t.me/UT_guide)
♦️ [اشیا گمشده دانشگاه تهران](t.me/ut_lostfound)
♦️ [اساتید دانشگاه تهران](t.me/UTeacherz)
♦️ [کوی ستان](https://t.me/Kooyestan)
♦️ [همیار (بسیج) دانشگاه تهران](https://t.me/hamyarUT)
♦️ [کانال ut.ac](https://t.me/ut_ac)
♦️ [انتخاب واحد دانشگاه تهران](https://t.me/Evahed_UT) 

📢 کانال های اطلاع رسانی دانشگاه تهران (مخصوص فنی - مهندسی) : 
♦️ [آرشیو فیلم های دروس پایه دانشگاه تهران](http://t.me/OCpaye_98)
♦️ [کانال ECETrends](t.me/ecetrends)
♦️ [فنی یار](https://t.me/TVUniversity)
♦️ [صراط](https://t.me/utserat) 
♦️ [حکیم](https://t.me/hakim96_ut) 

📺 کانال ها و گروه های متفرقه(تفریحی) : 
🌀 [زایشگاه تهران](https://t.me/ZayeshgahTehran)
🌀 [یوتی موویز](https://t.me/utmovies)
🌀 [یوتی میوزیک ۱](https://t.me/UT_musics)
🌀 [یوتی میوزیک ۲](https://t.me/utmusics)
🌀 [اوتاکو (گروه انیمه)](https://t.me/UT_Otakus)
🌀 [گروه شعر و ادبیات دانشگاه تهران](https://t.me/ut_poem_group)

غیر ضروری:
🔸 [گروه کد فراموشی غذا](https://t.me/+RGMB1KZyhlZxTYd9)
🔸 [گروه کهاد دانشگاه تهران](https://t.me/+U2iPesX2LUgvrv-M)
🔸 [ورزشکاران دانشکده فنی](https://t.me/varzesh_fanni)
🔸 [معاونت فرهنگی فنی](https://t.me/engcultural_ut)
🔸 [باشگاه دانشجویان](https://t.me/utstudentsunion)
🔸 [کانال دانشگاه تهران دانشجو](https://t.me/daneshjo_ut)
🔸 [کتابخانه مرکزی دانشگاه تهران](https://t.me/UT_Central_Library)
🔸 [موسسه انتشارات دانشگاه تهران](https://t.me/UniversityofTehranPress)
🔸 [مرکز مشاوره دانشگاه تهران](https://t.me/UTcounseling)
🔸 [ورک شاپ دانشگاه تهران](https://t.me/UTworkshops)
🔸 [شورای صنفی کل دانشجویان دانشگاه تهران](https://t.me/UT_SENFI)
🔸 [سپیدار (بسیج دانشجویی دانشگاه تهران)](https://t.me/sepidar_ut)
🔸 [جامعه اسلامی دانشگاه تهران](https://t.me/JAD_ut)
🔸 [آرمان دانشگاه تهران](https://t.me/ut_edalatkhahi)
🔸 [دانشگاه تهران (نیوزلاین)](https://t.me/UT_NEWSLINE)
🔸 [كانال خوابگاه دانشگاه](https://t.me/khabgahut)
  `,
    options
  );
  menu = "main_menu";
});

// Sending the complete list of the ut groups::
bot.hears(backButton, (ctx) => {
  let options = {};
  let text = "";
  switch (menu) {
    case "search_menu0":
      options = {
        reply_markup: { keyboard: mainKeyboard, resize_keyboard: true },
        disable_web_page_preview: true,
        parse_mode: "Markdown",
      };
      text = "چطور می‌تونم بهت کمک کنم؟!";
      menu = "main_menu";
      break;
    case "search_menu1":
      options = {
        reply_markup: { keyboard: backKeyboard, resize_keyboard: true },
        disable_web_page_preview: true,
        parse_mode: "Markdown",
      };
      text = "اسم استاد مدنظرت چیه؟!";
      menu = "search_menu0";
      break;

    default:
      break;
  }

  bot.telegram.sendMessage(ctx.chat.id, text, options);
});

// searching for a professor:
bot.on();

// launching the bot:
bot.launch();
