//get login page
function getLogin(req, res, next) {
  if (res.locals.user) {
    const currentUser = res.locals.user;
    currentUser.rooms.sort(function (a, b) {
      let x = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      return x * -1;
    });
    let userRooms = [];
    currentUser.rooms.forEach((el) => {
      userRooms.push(el._id);
    });
    res.render("dashboard", {
      user: currentUser,
      userRooms,
    });
  } else res.render("index");
}

module.exports = {
  getLogin,
};
