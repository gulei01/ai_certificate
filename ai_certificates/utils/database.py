# import logging
import pymysql

# logger = logging.getLogger("baseSpider")


class db_helper:
    def __init__(self, host="127.0.0.1", user='root', password="1234", db="ai_certificate"):
        self.host = host
        self.user = user
        self.password = password
        self.db = db
        self.conn = None
        self.cur = None

    def connect_database(self):
        try:
            self.conn = pymysql.connect(
                self.host, self.user, self.password, self.db, charset='utf8')
        except:
            print("fail to connect to database...")
            return False
        self.cur = self.conn.cursor()
        return True

    def close(self):
        if self.conn or self.cur:
            self.cur.close()
            self.conn.close()
        return True

    def execute(self, sql, params=None):
        if self.connect_database():
            try:
                if self.conn and self.cur:
                    self.cur.execute(sql, params)
                    self.conn.commit()
            except:
                self.close()
                print("sql execute fail...")
                # logger.error("execute failed: ",sql)
                # logger.error("params: ",params)
                return False
            return True
        else:
            return False

    def query(self, sql, params=None):
        self.execute(sql, params)
        return self.cur.fetchall()

a = db_helper()
