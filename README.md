## Git Press +

[Git Press +](http://www.gitpress.org) is a light weight tool to create the web site of your github project on easist way.

You can build your own site just follow three steps:

### Step ONE 

If you don't have a README.md (or README.markdown) file on your project, create one.

### Step TWO

Create a configure file named gitpress.json on your project.

```
touch gitpress.json & echo '{}' > gitpress.json
git add gitpress.json
git commit -a -m 'add gitpress configure' & git push origin master
```

### Step THREE

visit your site with `http://<repo>.<user>.gitpress.org`

**When you push your files to your project, the new updates will effected in 2 or 3 minutes.**

-------------

<br/>

### Setup on your webserver

If you want to run gitpress server on your own webserver, it is still so easy: 

```bash
sudo npm install gitpress
sudo gitpress your_username/your_repo
```

Then visit: http://localhost:8361

### License

MIT
