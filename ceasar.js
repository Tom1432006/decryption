class Ceasar{
    text = "";
    translated_text = "";
    key = 0;
    texts = [];
    biagramme = [];

    constructor(text){
        this.text = text.toUpperCase();
        this.loadBiagramms("deutsch");
        this.analyse();
    }
    
    printResult(){
        var res = "<div id='ceasar_result'>Score: " + this.scoreText(this.translated_text) + " -- Key: " + this.key + "<br>" + this.translated_text + "</div>";
        return res;
    }

    /**
     * find the text with the best score
     */
    analyse(){
        var best_score = 0;
        var bestKey = 0;
        for(var i = 0; i<26; i++){
            var score = this.scoreText(this.verschieben(i));
            if(score > best_score){
                best_score = score;
                bestKey = i;
            }
        }
        this.key = bestKey;
        this.translated_text = this.verschieben(bestKey);
    }

    /**
     * shift the text by an index like you do in the Ceasar encryption
     * @param {Int} index 
     * @returns text
     */
    verschieben(index){
        var text_split = this.text.split("");

        for(let i = 0; i<text_split.length; i++){
            let text_ascii = text_split[i].charCodeAt(0);
            
            if(text_ascii < 64 || text_ascii > 91) continue;

            let new_text_ascii = (text_ascii + index);
            if(new_text_ascii > 90) new_text_ascii -= 26;

            text_split[i] = String.fromCharCode(new_text_ascii);
        }

        return text_split.join('');
    }

    /**
     * score the text by adding the propabilitys of all the biaramms together
     * and devide the text by its length, to always have the same magnitude regardless
     * the texts length
     * @param {string} text text to score
     * @returns double score
     */
    scoreText(text){
        let score = 0;

        for(var i = 0; i<text.length-1; i++){
            if(text.charCodeAt(i) < 65 || text.charCodeAt(i) > 90 || text.charCodeAt(i+1) < 65 || text.charCodeAt(i+1) > 90) continue;
            score += Number(this.biagramme[text.charCodeAt(i)-65][text.charCodeAt(i+1)-65]);
        }

        return score/text.length;
    }
    
    loadBiagramms(language){
        var bigram = [];
        $.ajax({
            url: 'biagramme/' + language + '.txt',
            type: 'get',
            async: false,
            success: function(text) {
                bigram = text.split("\r\n").map(function(el){ return el.split(" ");});
            }
        });
        this.biagramme = bigram;
    }
}