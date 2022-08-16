function getHtmlQuestion(question) {
	var q = question["q"];
	var html = "<div class='question'>";
	html += "<div class='dateAdded'>";
	html += question["addedDate"];
	html += "</div>";
	html += "<div class='questionText'>";
	html += q;
	html += "</div>";

	html += "<div class='answer'>";
	html += question["a"];
	html += "</div>";
	html += "</div>";
	return html;
}

function getHtmlQuestions(questions) {
	var result = "";
	questions.forEach((question) => {
		result += getHtmlQuestion(question);
	});
	return result;
}

function getHtml(element) {
	var html = "<div>";
	html += "<div class='title'>";
	html += element["title"];
	html += "</div>";

	html += "<div class='questions'>";
	html += getHtmlQuestions(element["questions"]);
	html += "</div>";

	html += "</div>";
	return html;
}

var loadedJson = "";

function filterQuestion(question, filterString) {

	if (filterString) {
		var q = question["q"].toUpperCase();
		filterString = filterString.toUpperCase().trim();
		var result = q.includes(filterString);

		if (result) {
			return true;
		}

		var array = filterString.split(' ').filter((elementWord) => {
			elementWord = elementWord.trim();
			if (elementWord && elementWord.length > 0)
				return true;
			return false;
		});;
		var array2 = array.filter((elementWord) => {
			elementWord = elementWord.trim();
			return q.includes(elementWord);
		});

		if (array2 && array2.length > 0 && array2.length >= array.length * 0.75)
			return true;
		else
			return false;
	}
	return true;
}

function filterQuestions(questions, filterString) {
	var resultQuestions = [];
	questions.forEach((element) => {
		var element2 = filterQuestion(element, filterString);
		if (element2)
			resultQuestions.push(element);
	});
	return resultQuestions;
}

function filterCategory(element, filterString) {
	var questionsResult = filterQuestions(element["questions"], filterString);
	if (questionsResult && questionsResult.length > 0) {
		element["question"] = questionsResult;
		return element;
	}
	return null;
}

function filterList(loadedJson, filterString) {
	var result = [];
	loadedJson.forEach((element) => {
		var element2 = filterCategory(element, filterString);
		if (element2)
			result.push(element2);
	});
	return result;
}

function refreshFaq(filterString) {
	var docMain = document.getElementById("faqIdMain");
	var htmlResult = "";

	var filtered = filterList(loadedJson, filterString);

	if (filtered && filtered.length > 0) {
		filtered.forEach((element) => {
			var html = getHtml(element);
			htmlResult += html;
		});
		docMain.innerHTML = htmlResult;
	}
	else {
		docMain.innerHTML = "Nessun risultato.";
	}
}

document.addEventListener("DOMContentLoaded", function () {
	var urlJson = "./assets/faq.json";
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	const q = urlParams.get('q');

	$.getJSON(urlJson, function (dataFromJson) {
		loadedJson = dataFromJson;
		refreshFaq(q);

	});

	var docSearch = document.getElementById("searchBarMain");

	if (q) {
		docSearch.value = q;
	}

	docSearch.addEventListener('input', function (e) {
		var value = e.target.value;
		//console.log(value);
		refreshFaq(value);
	});

});