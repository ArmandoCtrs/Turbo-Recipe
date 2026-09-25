# Development guide

You will need to install the following tools:
- Node (https://nodejs.org/en/download/)
	- NPM, the package manager for Node, should be included if you use the installer.
- Git for Windows (https://git-scm.com/install/windows)
    - Or, if working on Mac or Linux, install the appropriate version of Git.

## General development workflow

At a high level, here's how development will work:

1) For every new major feature, you'll create a branch, where all code for that feature will live.
2) Once your work is finished, you'll make a pull request (PR) ask somebody to review it.
3) Once someone looks over your work, you will merge it into the `main` branch.
4) This way, the `main` branch will *always* be final, working code.

If another person's feature (X) gets merged into `main` while you are still working on yours, this may
create a merge conflict.

- You may see on the PR page that "this branch has conflicts that must be resolved".
- In this case, you will need to perform a "rebase" operation.
- This "rewrites history" to pretend that X's changes were already in `main` before you
  made your branch.

## Git workflow

Go through this workflow whenever you're ready to start a new set of changes or a new feature.
Try to split up your branches into unique features to avoid creating too many. Try to stick
to working on that particular feature in its branch. This helps prevent merge conflicts.

Some examples of the scope of one branch:
- A branch to create a page of the website
- A branch to add AI endpoints to the backend
- A branch to improve the styling of the website
- A branch to add the login feature (frontend/backend)

**WHEN BEGINNING A NEW TASK:**
1) In GitHub:
	- Go to the ["Branches"](https://github.com/ArmandoCtrs/Turbo-Recipe/branches)
      page and select "New branch".
    - Name your branch and click "Create branch".

2) Locally:
	- Run `git fetch origin`
	- Run `git checkout <BRANCH_NAME>`

Now, you have checked out your branch, which is currently a copy of the main branch.
You can start making your changes in this branch and it won't affect the main code.

**WHEN ADDING CHANGES:**
1) Run `git commit -m "<Description of changes>"`
    - Run this incrementally as you finish up significant sub-parts of the work.
    - You will probably commit more than once in one session of programming.
2) Run `git push` occasionally.
    - A good rule of thumb is: every time you stop working, push your commits.

**WHEN FINISHED WITH YOUR CHANGES:**
1) Make sure all changes are pushed using `git push`.
2) Go to the ["Pull requests"](https://github.com/ArmandoCtrs/Turbo-Recipe/pulls) 
   page and select "New pull request".
    - Select the name of your branch.
    - When prompted, in the description of the PR, write a very brief description
      of the changes you made. This can be a bullet-pointed list.
3) *IMPORTANT!* Get somebody else to review your PR.
	- All PRs should be approved by another set of eyes.
	- Some strategies for reviewing someone else's PR:
		- Look over their changes in the GitHub website by clicking the "Commits" tab and exploring the changes.
		- Checkout their work locally and test it! This can be done by finding the branch name on the PR page, and then running `git fetch origin` + `git checkout <THEIR_BRANCH>` + `npm run dev`.
4) If somebody suggests changes to your PR, make those changes, and test them.
5) Once your PR is approved by somebody else, click "Merge".

**HANDLING MERGE CONFLICTS:**
1) Commit all your changes to your branch to prevent losing any work.
2) Run `git checkout main` and `git pull` to get all the new changes to the `main` branch.
3) Go back to your branch with `git checkout <BRANCH_NAME>`.
4) Run `git rebase main` to start the rebase process.
    - In VS Code, files with merge conflicts will light up with red exclamation marks.
    - Go into each file and follow the instructions to resolve all conflicts.
5) Run `git add .` and then `git rebase --continue`. You may need to do this several times to
   complete the rebase, since it goes commit by commit.
    - If you think that you've made a mistake in the middle of a rebase, you can always run
      `git rebase --abort`, which will undo everything you did since you first ran `git rebase`.
6) Once the rebase is complete, run `git push --force-with-lease`.
    - What is `--force-with-lease`? It tells GitHub that we just "rewrote history", and that's
      exactly what we meant to do.
7) Now, on the PR page, it should show that your branch is able to be merged.