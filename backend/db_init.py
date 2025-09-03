import json
from pymongo import MongoClient, DESCENDING, ASCENDING
from pymongo.collection import Collection
from pymongo.database import Database

# load json file
data = None
with open('db.json') as f:
    data = json.load(f)

client: MongoClient = MongoClient('mongodb://localhost:27017/')
db: Database = client.get_database('bomberman-clone')

# drop existing collection
if 'scores' in db.list_collection_names():
    db.drop_collection('scores')

scores_collection: Collection = db.scores

# compound index
scores_collection.create_index([
    ('mode', DESCENDING),
    ('lives', DESCENDING),
    ('level', DESCENDING),
    ('score', DESCENDING),
    ('time', ASCENDING),
    ('name', ASCENDING)
])

# insert data
scores_collection.insert_many(data['init_scores'])