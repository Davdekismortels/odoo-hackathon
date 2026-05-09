# 🚀 Team Guide: Collaborating on Our Odoo Project with GitLab

Welcome to the team! This guide will walk you through everything you need to know to start working on our Odoo project, even if you've never used GitLab or Git before.

---

## 1. What is GitLab?
Think of GitLab as a **shared folder for our code**, but much smarter. Instead of just overwriting each other's files, GitLab:
- Keeps a history of every change made (who, when, and what).
- Allows us to work on the same files at the same time without breaking things.
- Automatically tests our code to make sure it works.

---

## 2. Getting Started (One-Time Setup)

### Step A: Create Your Account
1.  Go to [GitLab.com](https://gitlab.com) and sign up for an account if you haven't already.
2.  Give your username to **Shyam** so they can invite you to the project.

### Step B: Set Up Your "ID Card" (SSH Key)
To send your changes to GitLab, you need a secure way to identify yourself without typing your password every time. This is called an **SSH Key**.

1.  **Generate a Key**: Open your terminal (on Linux/Mac) or Git Bash (on Windows) and type:
    ```bash
    ssh-keygen -t ed25519 -C "your_email@example.com"
    ```
    *(Just press Enter for all prompts to use the defaults).*
2.  **Copy the Key**:
    - **Linux**: `cat ~/.ssh/id_ed25519.pub`
    - **Windows**: Open `C:\Users\YourName\.ssh\id_ed25519.pub` in Notepad.
3.  **Add to GitLab**:
    - Go to [User Settings > SSH Keys](https://gitlab.com/-/profile/keys).
    - Click **Add new key**, paste the text you copied, and click **Add key**.

---

## 3. Getting the Code to Your Computer

Once you are invited to the project, you need to "Clone" it (download a linked copy).

1.  Find the project URL on GitLab (usually looks like `git@gitlab.com:xshya19-group/xshya19-project.git`).
2.  In your terminal, go to where you want to keep the project and run:
    ```bash
    git clone git@gitlab.com:xshya19-group/xshya19-project.git
    ```

---

## 4. Your Daily Workflow (The "Big 4" Commands)

Every day when you work, you will follow these steps:

### 1. Get the latest changes (PULL)
Before you start, make sure you have what others have finished.
```bash
git pull origin main
```

### 2. Make your changes
Edit files in the `custom_addons/` folder. This is where our Odoo modules live.

### 3. Save your progress locally (COMMIT)
Once you're happy with a change, "commit" it with a message describing what you did.
```bash
git add .
git commit -m "Added a new field to the customer view"
```

### 4. Send your changes to the team (PUSH)
Upload your work so others can see and use it.
```bash
git push origin main
```

---

## 5. Golden Rules for Collaboration

- **Communicate**: If you're going to edit the same file as someone else, let them know!
- **Commit Often**: Small, frequent updates are better than one giant update.
- **Write Good Messages**: "Fixed a bug" is okay, but "Fixed tax calculation in invoice module" is much better.
- **Don't Panic**: If you get a "Conflict" (Git doesn't know how to merge two people's changes), ask Shyam or a teammate for help! It happens to everyone.

---

## 6. Odoo Project Structure
- `custom_addons/`: **Work here!** Create your new modules or edit existing ones in this folder.
- `odoo.conf.example`: A template for your local Odoo setup.
- `.gitlab-ci.yml`: This is the "robot" that checks our code. Don't worry about editing this for now.

Happy coding! Let's build something great together. 🚀
