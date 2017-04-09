import os

# Grabs the folder where the script runs.

basedir = os.path.abspath(os.path.dirname(__file__))

# Enable debug mode.

DEBUG = False

# Secret key for session management. You can generate random strings here:

# http://clsc.net/tools-old/random-string-generator.php

SECRET_KEY = 'my precious'

# Connect to the database

SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:root@localhost:3306/zayo'
