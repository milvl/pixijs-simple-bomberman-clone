from flask import Flask, request, jsonify
from pymongo import MongoClient, DESCENDING, ASCENDING
from pymongo.collection import Collection
from pymongo.database import Database

app: Flask = Flask(__name__)

client: MongoClient = MongoClient('mongodb://localhost:27017/')
db: Database = client.get_database('bomberman-clone')
scores_collection: Collection = db.scores

@app.route('/api/submit_score', methods=['POST'])
def submit_score():
    if not request.json:
        return jsonify({'error': 'Bad request', 'message': 'No JSON received'}), 400

    score_data = request.json
    try:
        scores_collection.insert_one(score_data)
        return jsonify({'message': 'Score submitted successfully'}), 201
    except Exception as e:
        return jsonify({'error': 'Database error', 'message': str(e)}), 500

@app.route('/api/scores', methods=['GET'])
def get_scores():
    try:
        scores = {}
        for mode in ['normal', 'endless']:
            scores[mode] = {}
            for lives in [0, 1, 2, 3]:
                scores[mode][lives] = list(scores_collection.find({'mode': mode, 'lives': lives}).sort([('score', DESCENDING), ('time', ASCENDING)]).limit(10))
        for score in scores:
            for life in scores[score]:
                for i in range(len(scores[score][life])):
                    del scores[score][life][i]['_id']
        return jsonify(scores), 200
    except Exception as e:
        return jsonify({'error': 'Database error', 'retrieve-failure': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
