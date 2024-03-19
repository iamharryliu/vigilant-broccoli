import os


print(os.environ["MY_EMAIL"])
print(os.environ["MY_EMAIL_PASSWORD"])

# import threading
# import requests
# from bs4 import BeautifulSoup
# import sys

# sys.path.append("..")
# from tools.mail_handler import MailHandler


# url = "https://gtaupdate.com/"
# key_words = ["GALLOWAY RD", "KINGSTON RD", "LAWRENCE AVE"]
# emails = ["harryliu1995@gmail.com"]


# class HTMLPageParser:
#     def get_row_data(url, text):
#         response = requests.get(url)
#         if response.status_code != 200:
#             print("Failed to fetch the webpage:", response.status_code)
#             return
#         row_data = ""
#         soup = BeautifulSoup(response.text, "html.parser")
#         tables = soup.find_all("table")
#         for table in tables:
#             rows = table.find_all("tr")
#             for row in rows:
#                 cells = row.find_all("td")
#                 for cell in cells:
#                     if text in cell.get_text():
#                         row_data = [cell.get_text().strip() for cell in cells]
#         return row_data

#     def add_unique_result(url, key_word, results):
#         result = HTMLPageParser.get_row_data(url, key_word)
#         if result not in results:
#             results.append(result)

#     def get_rows_from_html():
#         results = []
#         threads = []
#         for key_word in key_words:
#             thread = threading.Thread(
#                 target=lambda: results.append(
#                     HTMLPageParser.add_unique_result(url, key_word, results)
#                 )
#             )
#             threads.append(thread)
#             thread.start()

#         for thread in threads:
#             thread.join()

#         return results


# results = HTMLPageParser.get_rows_from_html()
# if results:
#     results = [result for result in results if result]
#     MailHandler.email_to_list(
#         emails,
#         message={
#             "from": "GTA Update",
#             "subject": "GTA Update",
#             "body": MailHandler.format_for_email(results),
#         },
#     )
