// SFilm7 — public channel metadata and genre keywords from user-supplied cinema.apk.
// This contains configuration only, never APK binaries or copyrighted UI assets.
const rows = [
"UCJiEdWPxe70ovNOrf7Sxw6w|Rạp Phim Ngôn Tình",
"UCvBmcDW_JayWWDOl0Lw_4iw|Rạp Ngôn Tình",
"UCKuKC88aZlwK3oXwTWULNfg|Mọt Phim Review",
"UCcpdnT_kxSxL8_6baoxJiRA|Kiến Review Phim",
"UCkSJi9XuR98Uo1d8zCkg17w|Wow Phim",
"UC4mNXs90aRNX110aqaXtglg|Shiba Review Phim",
"UC6oscpFzFhpzkaeD2YiyNkA|Động Phim Trung",
"UCuUjrFgQsSYcITVMQLfcaPA|POCO PHIM",
"UCiTkj2wJNRxkEAaY2puCYUg|Kẹo Sữa Drama",
"UCYuErqAcywJRIBKEBY8c9JQ|Nghiện Hoa Ngữ",
"UC1mFfJg_JyvQ_shEFInAUMw|Góc Nhỏ Sủng Ái",
"UCk9FTxXjcmC_hmrZDsLjVMg|Đào Ngọt Drama",
"UCX8oe3DG5lg7FYWguvuGW0Q|Trà Trái Cây Drama",
"UCMEJoKapThmGosVgh97csZA|Tổng Tài Ngôn Tình",
"UChvn2EHKF2_Z16v9FRWm1Gg|Su Kem Drama",
"UCEMoiuWMB-Ag-dh5m9qJhQg|Ngôn Tình Drama",
"UCFp1z7Z40ixzoWF1j2MQz5Q|Tiệm Ngọt Drama",
"UCREn6D4dryOUPDNCf2C-SrA|Nanami Drama",
"UCuSkpW4gsbqLqZKeL5DMSSQ|Tiệm Phim Tina",
"UC9zQQs9vGOApeFpFwXhq_7Q|Bạch Xà Review",
"UC2mEy-5Zis1vu-vLb4V9szA|Tiểu Ái Review",
"UCBt6xJXXqACGF8PMZmOqFZw|Phim Ngắn Mộng Mơ",
"UCxca_wn2lBI2e-N1JsRQd5A|Vở Kịch Siêu Hay",
"UC2ph2YdO0O4C4DEmL4Hf5fg|Phim Ngắn Tình Mật",
"UCB3EuH1vRtu3IZVbJItJALg|Đại Đạo Vietsub|hh-tu-tien",
"UCsmPBkqBF9Z0BB46HFuRbxg|TT Vietsub|hh-tu-tien",
"UC5dfkRiIuvJu5j0TMWCiBWA|Ký Chủ Vietsub|hh-mat-the",
"UCiclgNQ88-_I6Sety1Mx-KA|Hân Hân Vietsub|hh-tu-tien",
"UCHcMJ6rxGpwFgV9RPVMSQrQ|Mỳ Vietsub|hh-he-thong",
"UCq0ISxfNXLKHFLHfMrTkOAw|TusVietsub|hh-tu-tien",
"UCkxWaV3YyIdCbnFgZ2wKceQ|Pe Vietsub|hh-co-trang",
"UCOQHUfdEJ4cgF_vDNzXMwWg|Giấc Mộng Tu Tiên|hh-tu-tien",
"UCQ43GATimROPrhYdbGJjNkg|Lucky Vietsub|hh-do-thi",
"UCevdKVBf9BG5SdkQQeV7YPQ|Em Tứ Vietsub|hh",
"UCoPNjcY27WOEec53VTr3hwg|Thiên Tuyết|hh",
"UCuI1nqXP-42UcBTTcEbI3Ag|Bách Huệ Vietsub|hh",
"UCGb92d__VZAy-WJfywGD5mQ|HH VietSub|hh",
"UCdF_aJadOOY-pYRjLxptjpA|Linh San Vietsub|hh",
"UCu37FJiY-13nLFp3DRNZjVA|Thiên Cơ Vietsub|hh",
"UCe8dWpNOUztyUX6AjLxuHiQ|Lười Tu Tiên 2D|hh",
"UC01gANlXXcHDwEgj55ItlLg|MyMy Vietsub|hh"
];
const genreRows = [
"tong-tai|Tổng tài|phim|tổng tài,ceo,chủ tịch,tài phiệt,thiếu gia,sếp,đốc quân",
"ty-phu|Tỷ phú giả nghèo|phim|tỷ phú,tỉ phú,giả nghèo,thử lòng,ăn mày,lao công,thân phận,giàu nhất,ẩn danh",
"bao-thu|Báo thù · Vả mặt|phim|trả thù,báo thù,vả mặt,sỉ nhục,coi thường,khinh,hãm hại,phản bội,lộ thân",
"hon-nhan|Hôn nhân · Ngoại tình|phim|ngoại tình,tiểu tam,ly hôn,vợ cũ,chồng cũ,nhân tình,mẹ chồng,nhà chồng,con dâu,tái hôn",
"thien-kim|Thiên kim · Hào môn|phim|thiên kim,hào môn,con gái thật,tráo đổi,thất lạc,em gái nuôi,đích nữ,tiểu thư",
"sung-ai|Ngọt sủng|phim|cưng chiều,sủng,yêu thầm,cuồng vợ,hợp đồng,cưới,kết hôn,bạn trai,ngọt",
"trong-sinh|Trọng sinh · Xuyên không|phim|trọng sinh,trùng sinh,sống lại,xuyên không,xuyên thành,xuyên vào,tiếng lòng",
"co-trang|Cổ trang|phim|hoàng đế,thái tử,vương gia,hoàng hậu,phi tần,tướng quân,cung,thê tử,biên ải,vương phi",
"hh-tu-tien|Tu tiên|hh|tu tiên,tu luyện,linh căn,tiên đế,kiếm tiên,tông môn,trúc cơ,nguyên anh,kết đan,đan điền,tiên giới,đạo tổ,chí tôn,ma đế,hồng hoang",
"hh-xuyen-khong|Xuyên không|hh|xuyên không,xuyên vào,xuyên thành,xuyên về",
"hh-trong-sinh|Trọng sinh|hh|trọng sinh,trùng sinh,hồi sinh,luân hồi,tái sinh,sống lại",
"hh-he-thong|Hệ thống|hh|hệ thống,kích hoạt,điểm danh,bản hack",
"hh-mat-the|Mạt thế · Kinh dị|hh|tận thế,mạt thế,quỷ,kinh dị,sinh tồn,quái đàm,zombie,trăng máu",
"hh-do-thi|Đô thị · Tổng tài|hh|tổng tài,thiếu gia,tỷ phú,thủ phú,hoa khôi,ly hôn,thiên kim,ở rể,vợ,nữ thần",
"hh-co-trang|Cổ trang · Lịch sử|hh|hoàng tử,thái tử,đại minh,tam quốc,đại tần,đại đường,vương gia,hoàng đế,tể tướng,triều,tướng quân,đích nữ"
];
const channels = rows.map((line,i) => {
  const [id,name,tag] = line.split("|");
  return { id,name,group:i<24?"phim":"hh",...(tag && tag!=="hh"?{genre:tag}:{}) };
});
const genres = genreRows.map(line=> {
  const [id,name,group,keywords]=line.split("|");
  return {id,name,group,keywords:keywords.split(",")};
});
export const catalog = {version:3,refreshMinutes:120,channels,genres,groups:[{id:"phim",name:"Phim truyện"},{id:"hh",name:"Hoạt hình"}]};
