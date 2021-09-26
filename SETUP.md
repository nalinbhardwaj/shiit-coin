# Sheet Setup Guide

To setup your own sheet that can mine ShiitCoin for you hands-free, set up as follows:

1. Sign in to your Google Account and visit the [mainnet sheet](https://docs.google.com/spreadsheets/d/1iilTYMgNZvOwXSnKA4ebKzSee4eWY7i3LJ9FObhlmKk/edit#gid=304846221), create a new sheet using the + button at the bottom left, and copy one of the existing "User_\*" sheets into your new sheet.

2. Rename your sheet to start with "user_". The remaining string can be anything unique like your real name or a pseudonym.

2. Protect your sheet using the dropdown from the bottom right of your sheet tab. Click "Set Permissions" and select yourself in the dialog box.

<p float="left" align="middle">
  <img hspace="20" width="234" alt="Protect Sheet" src="https://user-images.githubusercontent.com/6984346/134820273-24a39d7d-76c3-4920-b091-40886bed27b9.png">
  <img width="467" alt="Set Permissions" src="https://user-images.githubusercontent.com/6984346/134820271-594b4e58-ed57-4313-88bc-6abcc43924ba.png">
</p>

3. Edit cell B1 ("My Address") and paste in your **public** address. This is the address that will recieve rewards from blocks your client mines.

4. Visit [Google Drive Homepage](https://drive.google.com/drive/u/0/priority), click "New" on top left, go to the "More" dropdown, and select "Google Apps Script".

5. Paste in the contents of [user.gs](https://github.com/nalinbhardwaj/shiit-coin/blob/main/sheet/user.gs) in the opened script. Edit the variable `SELF_NAME` in line 4 to match the name of your sheet(that you created in Step 2). Click Save and select the "runner" function in the top bar. Now click "Run". You should get a prompt requesting permissions.

<img width="425" alt="Request Permissions" src="https://user-images.githubusercontent.com/6984346/134820598-10325bbd-0dc0-4add-94df-d76806bf36fa.png">

6. Select _Advanced > Go to \<Project name\>_. Obviously, as Google warns you, you should only proceed if you trust the code in question (which is pulled straight from this repository on GitHub). We are not responsible for the safety of your account.

<p float="left" align="middle">
  <img hspace="20" width="335" alt="Screenshot 2021-09-26 at 11 52 21 AM" src="https://user-images.githubusercontent.com/6984346/134820684-251f8fcb-af36-4298-b7eb-531b9f5c4bdf.png">
  <img width="333" alt="Screenshot 2021-09-26 at 11 52 36 AM" src="https://user-images.githubusercontent.com/6984346/134820686-0fa7187b-1b5e-44a7-93cb-e5443cc076e6.png">
</p>

7. Now, you be redirected back to Google Apps Script, where you should see a "Execution started" message, and soon afterwards a "Execution completed" message.

8. Finally, set up the script to mine hands-free by adding a trigger for the script every 5 minutes: Click the clock icon on the left sidebar and select "Add Trigger" at the bottom right. In the dialog box, select parameters to match the values in the screenshot below:

<img width="373" alt="Trigger parameters" align="middle" src="https://user-images.githubusercontent.com/6984346/134821342-c369cc09-5243-44af-847b-42c3b9f765fa.png">

And that should be all! If you followed all the steps correctly so far, you should have your very own mining, gossip and wallet with non-zero balance when you successfully mine a block.
