
class Layout(object):
    def __init__(self, name, wid, hgt, desc, icon):
        self.name = name
        self.wid = wid
        self.hgt = hgt
        self.desc = desc
        self.icon = icon

    def params(self):
        res = "layout=%s&wid=%s" % (self.name, self.wid)
        if self.hgt is not None:
            res += "&hgt=%s" % self.hgt
        return res

layouts = [
    Layout('Rect', 14, 14, "Small Square", "littlesquare.jpg"),
    Layout('Rect', 29, 29, "Large Square", "largesquare.jpg"),
    Layout('Star', 21, None, "Small Star", "littlestar.jpg"),
    Layout('Star', 37, None, "Large Star", "largestar2.png"),
    Layout('Hexagon', 15, None, "Small Hexagon", "littlehexagon.jpg"),
    Layout('Hexagon', 31, None, "Large Hexagon", "largehexagon.jpg"),
    Layout('Circle', 15, None, "Small Circle", "littlecircle.jpg"),
    Layout('Circle', 29, None, "Large Circle", "largecircle.jpg"),
    Layout('Heart', 7, 2, "Small Heart", "littleheart.jpg"),
    Layout('Heart', 17, 2, "Large Heart", "largeheart.jpg"),
]
