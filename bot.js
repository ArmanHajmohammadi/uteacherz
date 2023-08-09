// ############# Defining and importing #############
// importing the needed libraries:
const { Telegraf, Markup } = require("telegraf");
const sqlite3 = require("sqlite3").verbose();

// defining the bot and give it the token:
const token = "6591935311:AAGrX_PgnpqmHpeSYytXGt4cHPpjwc_1e54";
const bot = new Telegraf(token);

// holding the current circumstance of the keyboard and menu:
//   circumstances:
//     main_menu
//     search_menu
//     search_results
//     prof_options
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

const profKeyboard = [
  ["🎖 نمره‌دهی به استاد"],
  ["📝 نظرات دانشجویان"],
  ["💬 ثبت نظر"],
  [backButton],
];

let resultsKeyboard = [];

// ################## Functions ###################
function replaceEnglishDigitsWithPersian(str) {
  const englishDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

  for (let i = 0; i < englishDigits.length; i++) {
    str = str.replace(new RegExp(englishDigits[i], "g"), persianDigits[i]);
  }

  return str;
}

function resetBot(chatID) {
  const options = {
    reply_markup: { keyboard: mainKeyboard, resize_keyboard: true },
  };
  bot.telegram.sendMessage(
    chatID,
    `متوجه نشدم! چه کاری برات انجام بدم؟!`,
    options
  );
  menu = "main_menu";
}
// ################## Database Functions #####################
function searchByName(profName, callback) {
  // opening the database:
  const db = new sqlite3.Database("./Data/uteacherz.db");

  // Prepare a parameterized SELECT query with a placeholder (?)
  const query = "SELECT * FROM teacher WHERE name LIKE ?";

  // Create a prepared statement
  const statement = db.prepare(query);

  // Execute the prepared statement with the search string as a parameter
  statement.all("%" + profName + "%", (err, rows) => {
    if (err) {
      console.error(err.message);
      callback(err, null);
      return;
    }

    // Extract the values from the rows and store them in a new array
    const resultArray = rows.map((row) => row);

    callback(null, resultArray);

    statement.finalize((error) => {
      if (error) {
        console.error(error.message);
      }
    });

    db.close((error) => {
      if (error) {
        console.error(error.message);
      }
    });
  });
}

// ################## Bot commands ###################
// start command:
bot.start((ctx) => {
  try {
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
  } catch (error) {
    console.error(error);
  }
});

// help command:
bot.help((ctx) => {
  try {
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
  } catch (error) {
    console.error(error);
  }
});

// Searching for a professor:
bot.hears(searchButton, (ctx) => {
  try {
    const options = {
      reply_markup: { keyboard: backKeyboard, resize_keyboard: true },
    };
    bot.telegram.sendMessage(ctx.chat.id, `اسم استاد مدنظرت چیه؟!`, options);
    menu = "search_menu";
  } catch (error) {
    console.error(error);
  }
});

// Sending an index of the posts of the ut guide channel:
bot.hears(UTPostsButton, (ctx) => {
  try {
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
  } catch (error) {
    console.error(error);
  }
});

// Sending the ccomplete list of the ut groups::
bot.hears(UTSocietyButton, (ctx) => {
  try {
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
  } catch (error) {
    console.error(error);
  }
});

// Sending the complete list of the ut groups::
bot.hears(backButton, (ctx) => {
  try {
    let options = {};
    let text = "";
    switch (menu) {
      case "search_menu":
        options = {
          reply_markup: { keyboard: mainKeyboard, resize_keyboard: true },
          disable_web_page_preview: true,
          parse_mode: "Markdown",
        };
        text = "چطور می‌تونم بهت کمک کنم؟!";
        menu = "main_menu";
        break;
      case "search_results":
        options = {
          reply_markup: { keyboard: backKeyboard, resize_keyboard: true },
          disable_web_page_preview: true,
          parse_mode: "Markdown",
        };
        text = "اسم استاد مدنظرت چیه؟!";
        menu = "search_menu";
        break;
      case "prof_options":
        options = {
          reply_markup: { keyboard: resultsKeyboard, resize_keyboard: true },
        };
        text = "از بین نتایج، استاد مورد نظرت رو انتخاب کن:";
        menu = "search_results";
        break;
      case "numpad":
        options = {
          reply_markup: { keyboard: profKeyboard, resize_keyboard: true },
        };
        text = "چه کاری میخوای انجام بدی؟";
        menu = "prof_options";
        break;
      default:
        options = {
          reply_markup: { keyboard: mainKeyboard, resize_keyboard: true },
          disable_web_page_preview: true,
          parse_mode: "Markdown",
        };
        text = `
  سلام ${ctx.from.first_name != undefined ? ctx.from.first_name : ""} ${
          ctx.from.last_name != undefined ? ctx.from.last_name : ""
        } ☺️
حالت چطوره؟! امیدوارم کیفت کوک باشه! :)
خوشحال میشم اگر توی انتخاب استاد مناسب بتونم بهت کمک کنم. اینجا میتونی نظر دانشجوهای دیگه رو بخونی و یا نظر خودت رو در مورد اساتید ثبت کنی!
اگر هم سوالی داشتی و من نتونستم بهت کمک کنم، سوالت رو حتما توی [گروه دانشگاه تهران](t.me/UTGroups) بپرس. اونجا دانشجوهای دیگه حضور دارن و حتما راهنماییت میکنن 😌
موفق باشی ✌️

برای خوندن راهنمای ربات، دستور /help رو وارد کن :)`;
        menu = "main_menu";
        break;
    }

    bot.telegram.sendMessage(ctx.chat.id, text, options);
  } catch (error) {
    console.error(error);
  }
});

// Sending the ccomplete list of the ut groups::
bot.hears("🎖 نمره‌دهی به استاد", (ctx) => {
  try {
    if (menu == "prof_options") {
      const options = {
        reply_markup: { keyboard: numpad, resize_keyboard: true },
      };
      bot.telegram.sendMessage(
        ctx.chat.id,
        `به این استاد از ۰ تا ۱۰ چند میدی؟`,
        options
      );
      menu = "numpad";
    } else {
      resetBot(ctx.chat.id);
    }
  } catch (error) {
    console.error(error);
  }
});

// recieving any text:
bot.hears(/.*/, (ctx) => {
  try {
    if (menu == "search_menu") {
      if (ctx.message.text.length < 3) {
        const options = {
          reply_markup: { keyboard: backKeyboard, resize_keyboard: true },
        };
        bot.telegram.sendMessage(
          ctx.chat.id,
          `
      اسم استاد نمی‌تونه کمتر از ۳ حرف باشه!
      لطفا یک اسم طولانی‌تر رو امتحان کن :)`,
          options
        );
        menu = "search_menu";
      } else {
        searchByName(ctx.message.text, (err, resultArray) => {
          if (err) {
            console.error("Error:", err);
            return;
          }

          if (resultArray.length > 0) {
            resultsKeyboard = [];
            for (let i = 0; i < 11 && i < resultArray.length; i++) {
              resultsKeyboard.push([resultArray[i].name.toString()]);
            }
            resultsKeyboard.push([backButton]);

            const options = {
              reply_markup: {
                keyboard: resultsKeyboard,
                resize_keyboard: true,
              },
            };
            bot.telegram.sendMessage(
              ctx.chat.id,
              `از بین ${replaceEnglishDigitsWithPersian(
                resultArray.length.toString()
              )} استاد یافت شده، استاد مورد نظرت رو انتخاب کن!`,
              options
            );
            menu = "search_results";
          } else {
            const options = {
              reply_markup: { keyboard: backKeyboard, resize_keyboard: true },
            };
            bot.telegram.sendMessage(
              ctx.chat.id,
              `متاسفانه نتونستم چنین استادی رو پیدا کنم 😔
یه بار دیگه اسم استاد مد نظرت رو بهم میدی؟!`,
              options
            );
            menu = "search_results";
          }
        });
      }
    } else if (menu == "search_results") {
      searchByName(ctx.message.text, (err, resultArray) => {
        if (err) {
          console.error("Error:", err);
          return;
        }
        if (resultArray.length == 1) {
          // defining the caption
          let caption = `👤 [${resultArray[0].name.toString()}](${resultArray[0].URL.toString()})\n`;

          //// checking for email
          if (
            resultArray[0].email.toString().length > 3 &&
            resultArray[0].email.toString().includes("@")
          ) {
            caption +=
              "\n✉️ ایمیل استاد:\n" +
              resultArray[0].email
                .toString()
                .replace("@@", "@")
                .replace("G@", "@") +
              "\n";
          }

          //// checking for degree
          if (resultArray[0].degree.toString().length > 3) {
            caption += "\n🎖 درجه: " + resultArray[0].degree.toString() + "\n";
          }

          //// checking for work place
          if (resultArray[0].workplace.toString().length > 3) {
            caption +=
              "\n🏢 محل کار: " +
              resultArray[0].workplace
                .toString()
                .replace("پرديس دانشکده هاي فني / ", "")
                .replace("پردیس دانشکده های فنی / ", "") +
              "\n";
          }

          //// checking for telephone number
          if (
            resultArray[0].telephone.toString().length > 3 &&
            !(
              resultArray[0].telephone.toString().includes("?") ||
              resultArray[0].telephone.toString().includes("؟")
            )
          ) {
            caption +=
              "\n☎️ شماره تماس: " + resultArray[0].telephone.toString() + "\n";
          }

          //// checking for the rate:
          if (resultArray[0].score != 0.0) {
            caption +=
              "\n⭐️نمره‌ی استاد از دید دانشجویان: " +
              resultArray[0].score.toFixed(1).toString() +
              `/10 (${resultArray[0].score_num.toString()} رای)\n`;
          }

          // adding the ID of the bot
          caption += "\n[ربات اساتید دانشگاه تهران](t.me/UTeachersBot)";

          // setting the options
          const options = {
            caption: caption,

            reply_markup: { keyboard: profKeyboard, resize_keyboard: true },
            parse_mode: "Markdown",
            disable_web_page_preview: true,
          };
          // sending the message
          bot.telegram.sendPhoto(
            ctx.chat.id,
            { source: `./Data/photos/${resultArray[0].id}.jpg` },
            options
          );
          menu = "prof_options";
        } else {
          const options = {
            reply_markup: { keyboard: resultsKeyboard, resize_keyboard: true },
          };
          bot.telegram.sendMessage(
            ctx.chat.id,
            "از بین نتایج، استاد مورد نظرت رو انتخاب کن:",
            options
          );
          menu = "search_results";
        }
      });
    } else {
      resetBot(ctx.chat.id);
    }
  } catch (error) {
    console.error(error);
  }
});

// launching the bot:
bot.launch();
