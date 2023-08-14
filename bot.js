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
//     submitting_comment
let usersInfo = {
  chatID: { menu: "main_menu", resultArray: [], resultsKeyboard: [] },
};
let botInfo = [];

// keyboard buttons:
const backButton = "◀️ بازگشت";
const searchButton = "🔎 جست و جو";
const UTSocietyButton = "🏛 جامعه ی دانشگاه تهران";
const UTPostsButton = "🗒 مطالب مفید";

// keyboards:
const mainKeyboard = [
  [searchButton],
  ["💳 حمایت"],
  [UTSocietyButton, UTPostsButton],
];

const backKeyboard = [[backButton]];

const numpad = [
  ["8", "9", "10"],
  ["5", "6", "7"],
  ["2", "3", "4"],
  [backButton, "0", "1"], // Spanning 2 columns
];

const profKeyboard = [
  ["🎖 نمره‌دهی به استاد"],
  ["📝 نظرات دانشجویان"],
  ["💬 ثبت نظر"],
  [backButton],
];

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
  if (usersInfo[chatID] == undefined) {
    usersInfo[chatID] = {};
  }
  usersInfo[chatID].menu = "main_menu";
}

function containsAbusiveWords(text) {
  text = text.replace(" ", "");
  text = text.replace("*", "");
  text = text.replace("/", "");
  text = text.replace("+", "");
  text = text.replace("-", "");
  text = text.replace(".", "");
  text = text.replace("|", "");
  text = text.replace("$", "");
  text = text.replace("%", "");
  text = text.replace("_", "");
  text = text.replace("#", "");
  text = text.replace("@", "");
  text = text.replace("!", "");
  text = text.replace(",", "");
  text = text.replace("÷", "");
  text = text.replace("×", "");
  text = text.replace("`", "");
  text = text.replace("\n", "");
  text = text.replace("\t", "");
  text = text.replace("َ", "");
  text = text.replace("ُ", "");
  text = text.replace("ِ", "");
  text = text.replace("ّ", "");
  text = text.replace("ۀ", "");
  text = text.replace("ً", "");
  text = text.replace("ٌ", "");
  text = text.replace("ٍ", "");
  text = text.replace("‌", "");
  text = text.replace("1", "");
  text = text.replace("2", "");
  text = text.replace("3", "");
  text = text.replace("4", "");
  text = text.replace("5", "");
  text = text.replace("6", "");
  text = text.replace("7", "");
  text = text.replace("8", "");
  text = text.replace("9", "");
  text = text.replace("0", "");
  const abusiveWords = [
    "@",
    "کسنن",
    "کصنن",
    "کسخوار",
    "کصخوار",
    "کسخار",
    "کصخار",
    "خوارکصده",
    "خارکصده",
    "خوارکسده",
    "خارکسده",
    "خوارکصه",
    "خوارکسه",
    "خارکصه",
    "خارکسه",
    "کصکش",
    "کسکش",
    "جنده",
    "جندگی",
    "گایید",
    "ننتو",
    "کیرم",
    "تخمم",
    "پتیاره",
    "مادرتو",
    "کیری",
    "کسشر",
    "کسوشر",
    "کصشر",
    "کصوشر",
    "کسشعر",
    "کسوشعر",
    "کصوشعر",
    "کصشعر",
    "تخم",
    "کیر",
    "kosekhar",
    "kosnan",
    "kosenan",
    "kharkos",
    "gayid",
    "jende",
    "madarjend",
    "tokhmam",
    "kiram",
    "koskesh",
    "gohnakhor",
    "nanato",
    "madareto",
    "petiyare",
    "petiare",
    "tkhmm",
    "jnde",
    "mdreto",
    "kososher",
    "kosesher",
    "kssher",
    "kossher",
    "kos",
    "جاکش",
    "گوه",
    "مادرخراب",
    "فاک",
    "ریدن",
    "ریده",
    "fuck",
    "ریدم",
  ];
  for (const word of abusiveWords) {
    if (text.toLowerCase().includes(word)) {
      return true;
    }
  }

  return false;
}
// ################## Database Functions #####################
function searchByName(profName, chatID, callback) {
  // opening the database:
  const db = new sqlite3.Database("./Data/uteacherz.db");

  // Prepare a parameterized SELECT query with a placeholder (?)
  const query = "SELECT * FROM professors WHERE fullName LIKE ?";

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
    usersInfo[chatID].resultArray = rows.map((row) => row);

    callback(null, usersInfo[chatID].resultArray);

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

function updateCell(teacherId, columnName, newValue) {
  // opening the database:
  const db = new sqlite3.Database("./Data/uteacherz.db");
  // Prepare the SQL query with placeholders for the parameters
  const sql = `UPDATE professors SET ${columnName} = ? WHERE id = ?`;

  // Execute the query with the parameters
  db.run(sql, [newValue, teacherId], function (err) {
    if (err) {
      console.error(err);
    } else {
      console.log(`Updated ${columnName} for professors with ID ${teacherId}`);
    }
  });
  db.close((error) => {
    if (error) {
      console.error(error.message);
    }
  });
}

function readBotInfo(rowId = 1) {
  return new Promise((resolve, reject) => {
    // opening the database:
    let db = new sqlite3.Database("./Data/uteacherz.db");

    db.get(`SELECT * FROM bot_info WHERE id = ?`, [rowId], (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      if (row) {
        resolve(row);
      } else {
        resolve(null);
      }
    });

    db.close();
  });
}

function writeBotInfo(rowId = 1, columnName, newValue) {
  return new Promise((resolve, reject) => {
    // opening the database:
    let db = new sqlite3.Database("./Data/uteacherz.db");

    const updateQuery = `UPDATE bot_info SET ${columnName} = ? WHERE id = ?`;

    db.run(updateQuery, [newValue, rowId], function (err) {
      if (err) {
        reject(err);
        return;
      }

      if (this.changes > 0) {
        resolve();
      } else {
        resolve(null);
      }
    });

    db.close();
  });
}
// ################## Bot commands ###################
// start command:
bot.start((ctx) => {
  try {
    if (usersInfo[ctx.chat.id] == undefined) {
      usersInfo[ctx.chat.id] = {};
    }
    readBotInfo(1)
      .then((row) => {
        if (row) {
          // Access the values from the row
          const blackList = row.black_list;

          if (blackList.toString().includes(ctx.chat.id.toString())) {
            ctx.reply(
              "⚠️ متاسفانه شما بلاک شده‌اید و حق استفاده از ربات را ندارید."
            );
            usersInfo[ctx.chat.id].menu = "main_menu";
          } else {
            readBotInfo(1)
              .then((row) => {
                if (row) {
                  // Access the values from the row
                  const blackList = row.black_list;
                  const users = row.users;
                  const usersCount = row.users_count;

                  // Use the data as needed
                  console.log("Bot Info:");
                  console.log("users:", users);
                  console.log("usersCount:", usersCount);
                  console.log("blackList:", blackList);

                  if (!users.toString().includes(ctx.chat.id.toString())) {
                    writeBotInfo(
                      1,
                      "users",
                      users + ctx.chat.id.toString() + "#"
                    )
                      .then(() => {
                        console.log("Cell updated successfully.");
                      })
                      .catch((error) => {
                        console.error(
                          "An error occurred while updating the cell:",
                          error
                        );
                      });
                    writeBotInfo(1, "users_count", usersCount + 1)
                      .then(() => {
                        console.log("Cell updated successfully.");
                      })
                      .catch((error) => {
                        console.error(
                          "An error occurred while updating the cell:",
                          error
                        );
                      });
                  }

                  // reply:
                  const options = {
                    reply_markup: {
                      keyboard: mainKeyboard,
                      resize_keyboard: true,
                    },
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

برای خوندن راهنمای ربات، دستور /help رو وارد کن :)

🤖 تعداد کاربران فعال ربات تا به این لحظه: ${replaceEnglishDigitsWithPersian(
                      (usersCount + 1).toString()
                    )}`,
                    options
                  );

                  usersInfo[ctx.chat.id].menu = "main_menu";
                } else {
                  console.log("Row not found in the bot_info table.");
                }
              })
              .catch((error) => {
                // Handle any errors that occurred during the database operation
                console.error(error);
              });
          }
        } else {
          console.log("Row not found in the bot_info table.");
        }
      })
      .catch((error) => {
        // Handle any errors that occurred during the database operation
        console.error(error);
      });
  } catch (error) {
    console.error(error);
  }
});

// help command:
bot.help((ctx) => {
  try {
    if (usersInfo[ctx.chat.id] == undefined) {
      usersInfo[ctx.chat.id] = {};
    }
    readBotInfo(1)
      .then((row) => {
        if (row) {
          // Access the values from the row
          const blackList = row.black_list;

          if (blackList.toString().includes(ctx.chat.id.toString())) {
            ctx.reply(
              "⚠️ متاسفانه شما بلاک شده‌اید و حق استفاده از ربات را ندارید."
            );
            usersInfo[ctx.chat.id].menu = "main_menu";
          } else {
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
            usersInfo[ctx.chat.id].menu = "main_menu";
          }
        } else {
          console.log("Row not found in the bot_info table.");
        }
      })
      .catch((error) => {
        // Handle any errors that occurred during the database operation
        console.error(error);
      });
  } catch (error) {
    console.error(error);
  }
});

// Searching for a professor:
bot.hears(searchButton, (ctx) => {
  try {
    if (usersInfo[ctx.chat.id] == undefined) {
      usersInfo[ctx.chat.id] = {};
    }
    readBotInfo(1)
      .then((row) => {
        if (row) {
          // Access the values from the row
          const blackList = row.black_list;

          if (blackList.toString().includes(ctx.chat.id.toString())) {
            ctx.reply(
              "⚠️ متاسفانه شما بلاک شده‌اید و حق استفاده از ربات را ندارید."
            );
            usersInfo[ctx.chat.id].menu = "main_menu";
          } else {
            const options = {
              reply_markup: { keyboard: backKeyboard, resize_keyboard: true },
            };
            bot.telegram.sendMessage(
              ctx.chat.id,
              `اسم استاد مدنظرت چیه؟!`,
              options
            );
            usersInfo[ctx.chat.id].menu = "search_menu";
          }
        } else {
          console.log("Row not found in the bot_info table.");
        }
      })
      .catch((error) => {
        // Handle any errors that occurred during the database operation
        console.error(error);
      });
  } catch (error) {
    console.error(error);
  }
});

// Sending an index of the posts of the ut guide channel:
bot.hears(UTPostsButton, (ctx) => {
  try {
    if (usersInfo[ctx.chat.id] == undefined) {
      usersInfo[ctx.chat.id] = {};
    }
    readBotInfo(1)
      .then((row) => {
        if (row) {
          // Access the values from the row
          const blackList = row.black_list;

          if (blackList.toString().includes(ctx.chat.id.toString())) {
            ctx.reply(
              "⚠️ متاسفانه شما بلاک شده‌اید و حق استفاده از ربات را ندارید."
            );
            usersInfo[ctx.chat.id].menu = "main_menu";
          } else {
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
            usersInfo[ctx.chat.id].menu = "main_menu";
          }
        } else {
          console.log("Row not found in the bot_info table.");
        }
      })
      .catch((error) => {
        // Handle any errors that occurred during the database operation
        console.error(error);
      });
  } catch (error) {
    console.error(error);
  }
});

// Sending the ccomplete list of the ut groups:
bot.hears(UTSocietyButton, (ctx) => {
  try {
    if (usersInfo[ctx.chat.id] == undefined) {
      usersInfo[ctx.chat.id] = {};
    }
    readBotInfo(1)
      .then((row) => {
        if (row) {
          // Access the values from the row
          const blackList = row.black_list;

          if (blackList.toString().includes(ctx.chat.id.toString())) {
            ctx.reply(
              "⚠️ متاسفانه شما بلاک شده‌اید و حق استفاده از ربات را ندارید."
            );
            usersInfo[ctx.chat.id].menu = "main_menu";
          } else {
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
            usersInfo[ctx.chat.id].menu = "main_menu";
          }
        } else {
          console.log("Row not found in the bot_info table.");
        }
      })
      .catch((error) => {
        // Handle any errors that occurred during the database operation
        console.error(error);
      });
  } catch (error) {
    console.error(error);
  }
});

// going one page back in the menu:
bot.hears(backButton, (ctx) => {
  try {
    if (usersInfo[ctx.chat.id] == undefined) {
      usersInfo[ctx.chat.id] = {};
    }
    readBotInfo(1)
      .then((row) => {
        if (row) {
          // Access the values from the row
          const blackList = row.black_list;

          if (blackList.toString().includes(ctx.chat.id.toString())) {
            ctx.reply(
              "⚠️ متاسفانه شما بلاک شده‌اید و حق استفاده از ربات را ندارید."
            );
            usersInfo[ctx.chat.id].menu = "main_menu";
          } else {
            let options = {};
            let text = "";
            switch (usersInfo[ctx.chat.id].menu) {
              case "search_menu":
                options = {
                  reply_markup: {
                    keyboard: mainKeyboard,
                    resize_keyboard: true,
                  },
                  disable_web_page_preview: true,
                  parse_mode: "Markdown",
                };
                text = "چطور می‌تونم بهت کمک کنم؟!";
                usersInfo[ctx.chat.id].menu = "main_menu";
                break;
              case "search_results":
                options = {
                  reply_markup: {
                    keyboard: backKeyboard,
                    resize_keyboard: true,
                  },
                  disable_web_page_preview: true,
                  parse_mode: "Markdown",
                };
                text = "اسم استاد مدنظرت چیه؟!";
                usersInfo[ctx.chat.id].menu = "search_menu";
                break;
              case "prof_options":
                options = {
                  reply_markup: {
                    keyboard: usersInfo[ctx.chat.id].resultsKeyboard,
                    resize_keyboard: true,
                  },
                };
                text = "از بین نتایج، استاد مورد نظرت رو انتخاب کن:";
                usersInfo[ctx.chat.id].menu = "search_results";
                break;
              case "numpad":
                options = {
                  reply_markup: {
                    keyboard: profKeyboard,
                    resize_keyboard: true,
                  },
                };
                text = "چه کاری میخوای انجام بدی؟";
                usersInfo[ctx.chat.id].menu = "prof_options";
                break;
              case "submitting_comment":
                options = {
                  reply_markup: {
                    keyboard: profKeyboard,
                    resize_keyboard: true,
                  },
                };
                text = "چه کاری میخوای انجام بدی؟";
                usersInfo[ctx.chat.id].menu = "prof_options";
                break;
              default:
                options = {
                  reply_markup: {
                    keyboard: mainKeyboard,
                    resize_keyboard: true,
                  },
                };
                text = `متوجه نشدم! چه کاری برات انجام بدم؟!`;
                usersInfo[ctx.chat.id].menu = "main_menu";
                break;
            }

            bot.telegram.sendMessage(ctx.chat.id, text, options);
          }
        } else {
          console.log("Row not found in the bot_info table.");
        }
      })
      .catch((error) => {
        // Handle any errors that occurred during the database operation
        console.error(error);
      });
  } catch (error) {
    console.error(error);
  }
});

// submitting a new rate:
bot.hears("🎖 نمره‌دهی به استاد", (ctx) => {
  try {
    if (usersInfo[ctx.chat.id] == undefined) {
      usersInfo[ctx.chat.id] = {};
    }
    readBotInfo(1)
      .then((row) => {
        if (row) {
          // Access the values from the row
          const blackList = row.black_list;

          if (blackList.toString().includes(ctx.chat.id.toString())) {
            ctx.reply(
              "⚠️ متاسفانه شما بلاک شده‌اید و حق استفاده از ربات را ندارید."
            );
            usersInfo[ctx.chat.id].menu = "main_menu";
          } else {
            if (
              usersInfo[ctx.chat.id].menu == "prof_options" &&
              usersInfo[ctx.chat.id].resultArray[0].rate_id
                .toString()
                .includes(ctx.chat.id.toString())
            ) {
              const options = {
                reply_markup: { keyboard: profKeyboard, resize_keyboard: true },
              };
              bot.telegram.sendMessage(
                ctx.chat.id,
                `تو قبلاً یک بار به این استاد نمره دادی. متاسفانه امکان نمره‌دهی مجدد نیست...`,
                options
              );
              usersInfo[ctx.chat.id].menu = "prof_options";
            } else if (usersInfo[ctx.chat.id].menu == "prof_options") {
              const options = {
                reply_markup: { keyboard: numpad, resize_keyboard: true },
              };
              bot.telegram.sendMessage(
                ctx.chat.id,
                `به این استاد از ۰ تا ۱۰ چند میدی؟`,
                options
              );
              usersInfo[ctx.chat.id].menu = "numpad";
            } else {
              resetBot(ctx.chat.id);
            }
          }
        } else {
          console.log("Row not found in the bot_info table.");
        }
      })
      .catch((error) => {
        // Handle any errors that occurred during the database operation
        console.error(error);
      });
  } catch (error) {
    console.error(error);
  }
});

// Submitting a new comment:
bot.hears("💬 ثبت نظر", (ctx) => {
  try {
    if (usersInfo[ctx.chat.id] == undefined) {
      usersInfo[ctx.chat.id] = {};
    }
    readBotInfo(1)
      .then((row) => {
        if (row) {
          // Access the values from the row
          const blackList = row.black_list;

          if (blackList.toString().includes(ctx.chat.id.toString())) {
            ctx.reply(
              "⚠️ متاسفانه شما بلاک شده‌اید و حق استفاده از ربات را ندارید."
            );
            usersInfo[ctx.chat.id].menu = "main_menu";
          } else {
            if (
              usersInfo[ctx.chat.id].menu == "prof_options" &&
              usersInfo[ctx.chat.id].resultArray[0].comment_id
                .toString()
                .includes(ctx.chat.id.toString())
            ) {
              const options = {
                reply_markup: {
                  keyboard: profKeyboard,
                  resize_keyboard: true,
                },
              };
              bot.telegram.sendMessage(
                ctx.chat.id,
                `تو قبلاً یک بار در مورد این استاد نظر دادی. متاسفانه امکان نظردهی مجدد نیست...`,
                options
              );
              usersInfo[ctx.chat.id].menu = "prof_options";
            } else if (usersInfo[ctx.chat.id].menu == "prof_options") {
              const options = {
                reply_markup: {
                  keyboard: backKeyboard,
                  resize_keyboard: true,
                },
              };
              bot.telegram.sendMessage(
                ctx.chat.id,
                `نظرت در مورد این استاد چیه؟!`,
                options
              );
              usersInfo[ctx.chat.id].menu = "submitting_comment";
            } else {
              resetBot(ctx.chat.id);
            }
          }
        } else {
          console.log("Row not found in the bot_info table.");
        }
      })
      .catch((error) => {
        // Handle any errors that occurred during the database operation
        console.error(error);
      });
  } catch (error) {
    console.error(error);
  }
});

// showing all of the comments:
bot.hears("📝 نظرات دانشجویان", (ctx) => {
  try {
    if (usersInfo[ctx.chat.id] == undefined) {
      usersInfo[ctx.chat.id] = {};
    }
    readBotInfo(1)
      .then((row) => {
        if (row) {
          // Access the values from the row
          const blackList = row.black_list;

          if (blackList.toString().includes(ctx.chat.id.toString())) {
            ctx.reply(
              "⚠️ متاسفانه شما بلاک شده‌اید و حق استفاده از ربات را ندارید."
            );
            usersInfo[ctx.chat.id].menu = "main_menu";
          } else {
            if (usersInfo[ctx.chat.id].menu == "prof_options") {
              // setting the options of the message:
              const options = {
                reply_markup: {
                  keyboard: profKeyboard,
                  resize_keyboard: true,
                },
              };

              for (let i = 1; i < 51; i++) {
                if (
                  usersInfo[ctx.chat.id].resultArray[0][`comment${i}`] !=
                    undefined &&
                  usersInfo[ctx.chat.id].resultArray[0][
                    `comment${i}`
                  ].toString().length < 50
                ) {
                  if (i == 1) {
                    // sending the message
                    bot.telegram.sendMessage(
                      ctx.chat.id,
                      `تا الان نظری در مورد این استاد ثبت نشده :(`,
                      options
                    );
                    break;
                  } else {
                    // sending the message
                    bot.telegram.sendMessage(
                      ctx.chat.id,
                      `همه‌ی نظراتی که در مورد این استاد ثبت شده بود رو برات فرستادم.`,
                      options
                    );
                    break;
                  }
                }
                // defining the inline keyboard:
                const reportKeyboard = [
                  {
                    text: "⚠️ گزارش",
                    callback_data:
                      "Report#" +
                      ctx.chat.id.toString() +
                      "#" +
                      i.toString() +
                      "#" +
                      usersInfo[ctx.chat.id].resultArray[0].id.toString(),
                    // Report#chatID#Comment_Number#ProfessorsID
                  },
                ];
                // sending the comments
                bot.telegram.sendMessage(
                  ctx.chat.id,
                  usersInfo[ctx.chat.id].resultArray[0][
                    `comment${i}`
                  ].toString(),
                  { reply_markup: { inline_keyboard: [reportKeyboard] } }
                );
              }

              usersInfo[ctx.chat.id].menu = "prof_options";
            } else {
              resetBot(ctx.chat.id);
            }
          }
        } else {
          console.log("Row not found in the bot_info table.");
        }
      })
      .catch((error) => {
        // Handle any errors that occurred during the database operation
        console.error(error);
      });
  } catch (error) {
    console.error(error);
  }
});

// Donate link:
bot.hears("💳 حمایت", (ctx) => {
  try {
    if (usersInfo[ctx.chat.id] == undefined) {
      usersInfo[ctx.chat.id] = {};
    }
    const options = {
      reply_markup: { keyboard: mainKeyboard, resize_keyboard: true },
      disable_web_page_preview: true,
      parse_mode: "Markdown",
    };
    bot.telegram.sendMessage(
      ctx.chat.id,
      `ممنونم از اینکه تصمیم گرفتی ما رو حمایت کنی 😊
برای حمایت روی [این لینک](https://zarinp.al/armanium) کلیک کن ❤️
اگرم لینک باز نشد، بی‌زحمت VPNات رو خاموش کن 😍`,
      options
    );
    usersInfo[ctx.chat.id].menu = "main_menu";
  } catch (error) {
    console.error(error);
  }
});

// report inline button handler
bot.action(/Report#/g, (ctx) => {
  if (usersInfo[ctx.chat.id] == undefined) {
    usersInfo[ctx.chat.id] = {};
  }
  readBotInfo(1)
    .then((row) => {
      if (row) {
        // Access the values from the row
        const blackList = row.black_list;

        if (blackList.toString().includes(ctx.chat.id.toString())) {
          ctx.reply(
            "⚠️ متاسفانه شما بلاک شده‌اید و حق استفاده از ربات را ندارید."
          );
          usersInfo[ctx.chat.id].menu = "main_menu";
        } else {
          // defining the inline keyboard:
          const reportKeyboard = [
            {
              text: "❌ حذف کامنت",
              callback_data:
                "Delete#" +
                ctx.callbackQuery.data.toString().split("#")[2] +
                "#" +
                ctx.callbackQuery.data.toString().split("#")[3],
            },
            {
              text: "🗑 گزارش بی‌مورد",
              callback_data:
                "Block#" + ctx.callbackQuery.data.toString().split("#")[1],
            },
          ];
          // editting the message
          ctx.editMessageText("گزارش شما ثبت شد.");
          // sending the comments
          bot.telegram.sendMessage(6116052382, ctx.callbackQuery.message.text, {
            reply_markup: { inline_keyboard: [reportKeyboard] },
          });
        }
      } else {
        console.log("Row not found in the bot_info table.");
      }
    })
    .catch((error) => {
      // Handle any errors that occurred during the database operation
      console.error(error);
    });
});

// delete inline button handler
bot.action(/Delete#/g, (ctx) => {
  if (usersInfo[ctx.chat.id] == undefined) {
    usersInfo[ctx.chat.id] = {};
  }
  const comment_number = ctx.callbackQuery.data.toString().split("#")[1];
  const professorID = ctx.callbackQuery.data.toString().split("#")[2];
  updateCell(professorID, `comment${comment_number}`, "");
  ctx.editMessageText("نظر با موفقیت حذف شد.");
});

// Block inline button handler
bot.action(/Block#/g, (ctx) => {
  if (usersInfo[ctx.chat.id] == undefined) {
    usersInfo[ctx.chat.id] = {};
  }
  readBotInfo(1)
    .then((row) => {
      if (row) {
        // Access the values from the row
        const blackList = row.black_list;
        const user_chat_id = ctx.callbackQuery.data.toString().split("#")[1];
        console.log("Bot Info:");
        console.log("blackList:", blackList);

        writeBotInfo(1, "black_list", blackList + user_chat_id + "#")
          .then(() => {
            console.log("Cell updated successfully.");
            ctx.editMessageText("کاربر با موفقیت بلاک شد.");
          })
          .catch((error) => {
            console.error("An error occurred while updating the cell:", error);
          });
      }
    })
    .catch((error) => {
      // Handle any errors that occurred during the database operation
      console.error(error);
    });
});

// recieving any text:
bot.hears(/.*/, (ctx) => {
  if (usersInfo[ctx.chat.id] == undefined) {
    usersInfo[ctx.chat.id] = {};
  }
  try {
    readBotInfo(1)
      .then((row) => {
        if (row) {
          // Access the values from the row
          const blackList = row.black_list;

          if (blackList.toString().includes(ctx.chat.id.toString())) {
            ctx.reply(
              "⚠️ متاسفانه شما بلاک شده‌اید و حق استفاده از ربات را ندارید."
            );
            usersInfo[ctx.chat.id].menu = "main_menu";
          } else {
            if (usersInfo[ctx.chat.id].menu == "search_menu") {
              if (ctx.message.text.length < 3) {
                const options = {
                  reply_markup: {
                    keyboard: backKeyboard,
                    resize_keyboard: true,
                  },
                };
                bot.telegram.sendMessage(
                  ctx.chat.id,
                  `
      اسم استاد نمی‌تونه کمتر از ۳ حرف باشه!
      لطفا یک اسم طولانی‌تر رو امتحان کن :)`,
                  options
                );
                usersInfo[ctx.chat.id].menu = "search_menu";
              } else if (/[a-zA-Z]/.test(ctx.message.text)) {
                const options = {
                  reply_markup: {
                    keyboard: backKeyboard,
                    resize_keyboard: true,
                  },
                };
                bot.telegram.sendMessage(
                  ctx.chat.id,
                  `اسم استاد نمیتونه شامل حرف انگلیسی باشه.
          لطفا اسم استادت رو فارسی وارد کن :)`,
                  options
                );
                usersInfo[ctx.chat.id].menu = "search_menu";
              } else if (/[0-9]/.test(ctx.message.text)) {
                const options = {
                  reply_markup: {
                    keyboard: backKeyboard,
                    resize_keyboard: true,
                  },
                };
                bot.telegram.sendMessage(
                  ctx.chat.id,
                  `اسم استاد نمیتونه شامل عدد باشه.
          لطفا اسم استادت رو دوباره وارد کن :)`,
                  options
                );
                usersInfo[ctx.chat.id].menu = "search_menu";
              } else {
                searchByName(
                  ctx.message.text,
                  ctx.chat.id,
                  (err, resultArray) => {
                    if (err) {
                      console.error("Error:", err);
                      return;
                    }

                    if (resultArray.length > 0) {
                      usersInfo[ctx.chat.id].resultsKeyboard = [];
                      for (let i = 0; i < 11 && i < resultArray.length; i++) {
                        usersInfo[ctx.chat.id].resultsKeyboard.push([
                          resultArray[i].fullName.toString(),
                        ]);
                      }
                      usersInfo[ctx.chat.id].resultsKeyboard.push([backButton]);

                      const options = {
                        reply_markup: {
                          keyboard: usersInfo[ctx.chat.id].resultsKeyboard,
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
                      usersInfo[ctx.chat.id].menu = "search_results";
                    } else {
                      const options = {
                        reply_markup: {
                          keyboard: backKeyboard,
                          resize_keyboard: true,
                        },
                      };
                      bot.telegram.sendMessage(
                        ctx.chat.id,
                        `متاسفانه نتونستم چنین استادی رو پیدا کنم 😔
یه بار دیگه اسم استاد مد نظرت رو بهم میدی؟!`,
                        options
                      );
                      usersInfo[ctx.chat.id].menu = "search_menu";
                    }
                  }
                );
              }
            } else if (usersInfo[ctx.chat.id].menu == "search_results") {
              searchByName(
                ctx.message.text,
                ctx.chat.id,
                (err, resultArray) => {
                  if (err) {
                    console.error("Error:", err);
                    return;
                  }
                  if (resultArray.length == 1) {
                    // defining the caption
                    let caption = `👤 [${resultArray[0].fullName.toString()}](https://profile.ut.ac.ir${resultArray[0].url.toString()})\n`;

                    //// checking for email
                    if (resultArray[0].email.toString().length > 3) {
                      caption +=
                        "\n✉️ ایمیل استاد:\n" +
                        resultArray[0].email.toString() +
                        "\n";
                    }

                    //// checking for degree
                    if (resultArray[0].degree.toString().length > 3) {
                      caption +=
                        "\n🎖 درجه: " + resultArray[0].degree.toString() + "\n";
                    }

                    //// checking for work place
                    if (resultArray[0].organizations.toString().length > 3) {
                      caption +=
                        "\n🏢 محل کار: " +
                        resultArray[0].organizations
                          .toString()
                          .replace(`[{"name":"`, "")
                          .replace(`"}]`, "") +
                        "\n";
                    }

                    //// checking for the rate:
                    if (resultArray[0].rate_number != 0) {
                      caption +=
                        "\n⭐️نمره‌ی استاد از دید دانشجویان: " +
                        resultArray[0].rate.toFixed(1).toString() +
                        `/10 (${resultArray[0].rate_number.toString()} رای)\n`;
                    }

                    // adding the ID of the bot
                    caption +=
                      "\n[ربات اساتید دانشگاه تهران](t.me/UTeachersBot)";

                    // setting the options
                    const options = {
                      caption: caption,

                      reply_markup: {
                        keyboard: profKeyboard,
                        resize_keyboard: true,
                      },
                      parse_mode: "Markdown",
                      disable_web_page_preview: true,
                    };
                    // sending the message
                    bot.telegram.sendPhoto(
                      ctx.chat.id,
                      {
                        url:
                          resultArray[0].image.length > 0
                            ? "https://profile.ut.ac.ir" +
                              resultArray[0].image.toString()
                            : "https://upload.wikimedia.org/wikipedia/fa/thumb/f/fd/University_of_Tehran_logo.svg/800px-University_of_Tehran_logo.svg.png",
                      },
                      options
                    );
                    usersInfo[ctx.chat.id].menu = "prof_options";
                  } else {
                    const options = {
                      reply_markup: {
                        keyboard: usersInfo[ctx.chat.id].resultsKeyboard,
                        resize_keyboard: true,
                      },
                    };
                    bot.telegram.sendMessage(
                      ctx.chat.id,
                      "از بین نتایج، استاد مورد نظرت رو انتخاب کن:",
                      options
                    );
                    usersInfo[ctx.chat.id].menu = "search_results";
                  }
                }
              );
            } else if (usersInfo[ctx.chat.id].menu == "numpad") {
              if (/\D/.test(ctx.message.text)) {
                const options = {
                  reply_markup: { keyboard: numpad, resize_keyboard: true },
                };
                bot.telegram.sendMessage(
                  ctx.chat.id,
                  `باید یک عدد بین ۰ و ۱۰ وارد کنی!`,
                  options
                );
                usersInfo[ctx.chat.id].menu = "numpad";
              } else if (
                parseInt(ctx.message.text) > 10 ||
                parseInt(ctx.message.text) < 0
              ) {
                const options = {
                  reply_markup: { keyboard: numpad, resize_keyboard: true },
                };
                bot.telegram.sendMessage(
                  ctx.chat.id,
                  `باید یک عدد بین ۰ و ۱۰ وارد کنی!`,
                  options
                );
                usersInfo[ctx.chat.id].menu = "numpad";
              } else {
                // Calculating the new rate:
                let rate =
                  parseFloat(
                    usersInfo[ctx.chat.id].resultArray[0].rate_number
                  ) *
                    parseFloat(usersInfo[ctx.chat.id].resultArray[0].rate) +
                  parseFloat(ctx.message.text);
                rate =
                  rate /
                  (parseFloat(
                    usersInfo[ctx.chat.id].resultArray[0].rate_number
                  ) +
                    1);
                // updating the database with new values
                updateCell(
                  usersInfo[ctx.chat.id].resultArray[0].id,
                  "rate",
                  rate
                );
                updateCell(
                  usersInfo[ctx.chat.id].resultArray[0].id,
                  "rate_number",
                  usersInfo[ctx.chat.id].resultArray[0].rate_number + 1
                );
                updateCell(
                  usersInfo[ctx.chat.id].resultArray[0].id,
                  "rate_id",
                  usersInfo[ctx.chat.id].resultArray[0].rate_id.toString() +
                    ctx.chat.id.toString() +
                    "#"
                );
                // updating the resultArray:
                searchByName(
                  usersInfo[ctx.chat.id].resultArray[0].fullName,
                  ctx.chat.id,
                  (err, resultArray) => {
                    if (err) {
                      console.error("Error:", err);
                      return;
                    }
                  }
                );
                // setting the options of the message:
                const options = {
                  reply_markup: {
                    keyboard: profKeyboard,
                    resize_keyboard: true,
                  },
                };
                // sending the message
                bot.telegram.sendMessage(
                  ctx.chat.id,
                  "نمره‌دهی با موفقیت انجام شد.",
                  options
                );
                usersInfo[ctx.chat.id].menu = "prof_options";
              }
            } else if (usersInfo[ctx.chat.id].menu == "submitting_comment") {
              if (ctx.message.text.length < 50) {
                const options = {
                  reply_markup: {
                    keyboard: backKeyboard,
                    resize_keyboard: true,
                  },
                };
                bot.telegram.sendMessage(
                  ctx.chat.id,
                  `نظرت نمی‌تونه کمتر از 50 کاراکتر باشه...`,
                  options
                );
                usersInfo[ctx.chat.id].menu = "submitting_comment";
              } else if (/[a-zA-Z]/.test(ctx.message.text)) {
                const options = {
                  reply_markup: {
                    keyboard: backKeyboard,
                    resize_keyboard: true,
                  },
                };
                bot.telegram.sendMessage(
                  ctx.chat.id,
                  `نظرت نمیتونه شامل حروف انگلیسی باشه. لطفاً نظرت رو تماماً فارسی تایپ کن :)`,
                  options
                );
                usersInfo[ctx.chat.id].menu = "submitting_comment";
              } else if (containsAbusiveWords(ctx.message.text.toString())) {
                const options = {
                  reply_markup: {
                    keyboard: backKeyboard,
                    resize_keyboard: true,
                  },
                };
                bot.telegram.sendMessage(
                  ctx.chat.id,
                  `خیلی بی‌ادبی 😔
این حرفای زشتو از کجا یادگرفتی؟ 😭
لطفاً این‌دفعه مودبانه نظرت رو بهم بگو...`,
                  options
                );
                usersInfo[ctx.chat.id].menu = "submitting_comment";
              } else {
                // updating the database with new values
                for (let i = 1; i < 51; i++) {
                  if (
                    usersInfo[ctx.chat.id].resultArray[0][
                      `comment${i}`
                    ].toString().length < 50
                  ) {
                    updateCell(
                      usersInfo[ctx.chat.id].resultArray[0].id,
                      `comment${i}`,
                      ctx.message.text.toString()
                    );
                    updateCell(
                      usersInfo[ctx.chat.id].resultArray[0].id,
                      "comment_id",
                      usersInfo[
                        ctx.chat.id
                      ].resultArray[0].comment_id.toString() +
                        ctx.chat.id.toString() +
                        "#"
                    );
                    // defining the caption
                    let postText = `👤 [${usersInfo[
                      ctx.chat.id
                    ].resultArray[0].fullName.toString()}](https://profile.ut.ac.ir${usersInfo[
                      ctx.chat.id
                    ].resultArray[0].url.toString()})\n`;
                    //// checking for degree
                    if (
                      usersInfo[ctx.chat.id].resultArray[0].degree.toString()
                        .length > 3
                    ) {
                      postText +=
                        "\n🎖 درجه: " +
                        usersInfo[
                          ctx.chat.id
                        ].resultArray[0].degree.toString() +
                        "\n";
                    }

                    //// checking for work place
                    if (
                      usersInfo[
                        ctx.chat.id
                      ].resultArray[0].organizations.toString().length > 3
                    ) {
                      postText +=
                        "\n🏢 محل کار: " +
                        usersInfo[ctx.chat.id].resultArray[0].organizations
                          .toString()
                          .replace(`[{"name":"`, "")
                          .replace(`"}]`, "") +
                        "\n";
                    }
                    postText = `✍️ نظر: 
${ctx.message.text.toString()}

@UTGroups`;

                    // reply:
                    const postOptions = {
                      disable_web_page_preview: true,
                      parse_mode: "Markdown",
                    };
                    bot.telegram.sendMessage(
                      "@uteacherz",
                      postText,
                      postOptions
                    );
                    // updating the resultArray:
                    searchByName(
                      usersInfo[ctx.chat.id].resultArray[0].fullName,
                      ctx.chat.id,
                      (err, resultArray) => {
                        if (err) {
                          console.error("Error:", err);
                          return;
                        }
                      }
                    );
                    break;
                  }
                }

                // setting the options of the message:
                const options = {
                  reply_markup: {
                    keyboard: profKeyboard,
                    resize_keyboard: true,
                  },
                };
                // sending the message
                bot.telegram.sendMessage(
                  ctx.chat.id,
                  `نظر شما با موفقیت ثبت شد.`,
                  options
                );

                usersInfo[ctx.chat.id].menu = "prof_options";
              }
            } else {
              resetBot(ctx.chat.id);
            }
          }
        } else {
          console.log("Row not found in the bot_info table.");
        }
      })
      .catch((error) => {
        // Handle any errors that occurred during the database operation
        console.error(error);
      });
  } catch (error) {
    console.error(error);
  }
});

// launching the bot:
bot.launch();
