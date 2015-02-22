#!/bin/bash

# generate docs to temp folder
jsduck --title=dstore lib/* -o /tmp/projector-docs

git stash
git checkout gh-pages

# copy files to gh-pages branch
rsync -av /tmp/projector-docs/ .

# commit & push
git add .
git commit -am 'updating docs'
git push origin gh-pages

# back to master
git checkout master
git stash apply
