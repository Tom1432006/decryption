class Score{
    biagramme = [];

    constructor(language){
        this.loadBiagramms(language);
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