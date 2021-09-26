# Sheet Setup Guide

To setup your own sheet that can mine ShiitCoin for you hands-free, set up as follows:

1. Sign in to your Google Account, visit the [mainnet sheet](https://docs.google.com/spreadsheets/d/1iilTYMgNZvOwXSnKA4ebKzSee4eWY7i3LJ9FObhlmKk/edit#gid=304846221), create a new sheet using the + button at the bottom left, and copy one of the existing "User_*" sheets into your new sheet.

1. Protect your sheet 

2. Edit cell B1 ("My Address") and paste in your **public** address. This is the address that will recieve rewards from blocks your client mines.

3. Visit [Google Drive Homepage](https://drive.google.com/drive/u/0/priority), click "New" on top left, go to the "More" dropdown, and click "Google Apps Script".

4. Paste in the contents of [user.gs](TODOFILL) in the opened script, click Save and select the "runner" function in the top bar. Now click "Run". You should get a prompt requesting permissions.

5. Select "Advanced" Obviously, as Google warns you, you should only proceed if you trust the code in question (which is pulled straight from this repository).