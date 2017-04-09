# ----------------------------------------------------------------------------#
# Imports
# ----------------------------------------------------------------------------#

from flask import Flask, render_template
from models import db_session, BuildingSchema, AccountSchema, SitesSchema
import csv
import os
from re import sub
from decimal import Decimal

# ----------------------------------------------------------------------------#
# App Config.
# ----------------------------------------------------------------------------#

app = Flask(__name__)
app.config.from_object('config')


# Automatically tear down SQLAlchemy.
@app.teardown_request
def shutdown_session(exception = None):
    db_session.remove()

# ----------------------------------------------------------------------------#
# Controllers.
# ----------------------------------------------------------------------------#


@app.route('/initialize')
def initialize():
    initialize_buildings()
    initialize_accounts()
    initialize_sites()
    return render_template('pages/placeholder.home.html')


def initialize_buildings():
    bs = BuildingSchema()
    base_dir = os.path.dirname(os.path.realpath(__file__))
    with open(base_dir + os.path.sep + 'data' + os.path.sep + 'ZayoHackathonData_Buildings.csv', 'rU') as building_file:
        reader = csv.DictReader(building_file, ['building_id', 'market', 'street_address',
                                                'city', 'state', 'postal_code', 'longitude',
                                                'latitude', 'on_zayo_network_status',
                                                'net_classification', 'type', 'network_proximity',
                                                'estimated_build_cost'])
        next(reader)
        for l in reader:
            l["estimated_build_cost"] = Decimal(sub(r'[^\d.]', '', l["estimated_build_cost"]))
            try:
                b = bs.load(l, session=db_session).data
                db_session.add(b)
            except:
                print "a data format exception occurred"
                l["postal_code"] = sub(r'[^\x00-\x7F]+', '', l["postal_code"])
                print l
                if not l["network_proximity"]:
                    l["network_proximity"] = 0
                if not l["latitude"]:
                    l["latitude"] = 0
                if not l["longitude"]:
                    l["longitude"] = 0
                b = bs.load(l, session=db_session).data
                db_session.add(b)

    db_session.commit()


def initialize_accounts():
    acs = AccountSchema()
    base_dir = os.path.dirname(os.path.realpath(__file__))
    with open(base_dir + os.path.sep + 'data' + os.path.sep + 'ZayoHackathonData_Accounts.csv', 'rU') as account_file:
        reader = csv.DictReader(account_file, ['account_id', 'industry', 'vertical', 'total_brr', 'annual_revenue',
                                               'number_of_employees', 'dandb_revenue', 'dandb_total_employees'])
        next(reader)
        for l in reader:
            l["total_brr"] = Decimal(sub(r'[^\d.]', '', l["total_brr"]))
            l["annual_revenue"] = Decimal(sub(r'[^\d.]', '', l["annual_revenue"]))
            l["dandb_revenue"] = Decimal(sub(r'[^\d.]', '', l["dandb_revenue"]))
            try:
                b = acs.load(l, session=db_session).data
                db_session.add(b)
            except:
                print "a data format exception occured"
                print l

    db_session.commit()


def initialize_sites():
    ss = SitesSchema()
    base_dir = os.path.dirname(os.path.realpath(__file__))
    with open(base_dir + os.path.sep + 'data' + os.path.sep + 'ZayoHackathonData_Sites.csv', 'rU') as site_file:
        reader = csv.DictReader(site_file, ['site_id', 'account_id', 'building_id'])
        next(reader)
        for l in reader:
            del l[None]
            try:
                b = ss.load(l, session=db_session).data
                b.account_id = l['account_id']
                b.building_id = l['building_id']
                db_session.add(b)
            except:
                print "a data format exception occured"
                print l

    db_session.commit()


@app.route('/')
def home():
    return render_template('pages/placeholder.home.html')


@app.route('/about')
def about():
    return render_template('pages/placeholder.about.html')


# Error handlers.


@app.errorhandler(500)
def internal_error(error):
    db_session.rollback()
    return render_template('errors/500.html'), 500


@app.errorhandler(404)
def not_found_error(error):
    return render_template('errors/404.html'), 404
"""
if not app.debug:
    file_handler = FileHandler('error.log')
    file_handler.setFormatter(
        Formatter('%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]')
    )
    app.logger.setLevel(logging.INFO)
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    app.logger.info('errors')
"""
# ----------------------------------------------------------------------------#
# Launch.
# ----------------------------------------------------------------------------#

# Default port:
if __name__ == '__main__':
    app.run()

# Or specify port manually:
'''
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
'''
