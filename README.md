# decryption Website

Webseite um Texte nach mehereren verschiedenen Methoden zu verschlüsseln, entweder per Hand oder Automatisch.
Die Verschiedenen Methoden sind als einzelne Klasse implementiert.
Main.js ist das Hauptskript, was das Frontend kontrolliert und mit den Verschlüsselungsklassen verbindet.
**Die Webseite ist auf [http://tom.reinisch.net/verschluesselung/](http://tom.reinisch.net/verschluesselung/) zu finden.**

## Aufbau

### Frontend

Der Aufbau der Seite ist in 3 Teile aufgeteilt.
Im ersten Teil gibt man den Verschlüsselten Text ein. Er besteht aus einer ```textarea``` und einem ```select``` mit Optionen für die Sprache.
Der zweite Teil ist das Interface. Er besteht aus meherern Tabs, zwischen den man hin und her schlaten kann.
Für jeden Verschlüsselungsmethode gibt es einen eigenen Tab, mit Textfeldern und Buttons.
Der drite Teil ist das Ergebniss der Entschlüsselung. Jede Entchlüsselungsklasse hat eine ```printResult()``` Methode,
die einen HTML-Code zurück gibt, welcher in das Element eingefügt wird.

### Dateisystem
Die JavaScript Dateien mit den verschiedenen Entschlüsselungsmethoden sind in dem Ordner ```decryption```.
Die Datensätze mit Worten, befindet sich in dem ```words``` Ordner, die Biagramme befinden sich in dem ```biagramme``` Ordner
und die Datensätze mit den Häufigkeiten der Buchstaben in der jeweiligen Sprache sind in dem ```letters``` Ordner.
Die Biagramme Datei, wird in einen 2D Array konvertiert, wo die Zeilen für den ersten Buchstaben stehen (0=A, 1=B, ...) und Spalten für den zweiten Buchstaben.
Wenn man also die Wahrscheilichkeit von "ab" herausfinden möchte, muss man schreiben ```biagramme[0][1]```.

## Entschlüsselungen

### Text Score

Um einen Text zu beurteilen, wie realistisch er ist, gibt es eine Klasse score mit der Methode ```scoreText(text)```, die
den Text, der als Parameter übergeben wird, bewertet und diesen zurückgibt. Der Score wird berechnet, indem sich immer ein Buchstaben paar
angeschaut wird und die Wahrscheinlichkeit, dass dieses Biagramm in der ausgewählten Sprache vorkommt zum Score addiert.
Zum Schluss wird der Score mit der Länge des Textes dividiert, um den Score immer im selben Bereich zu halten.

### Häufigkeitsanalyse (Monoalphabetische Substitution)

Bei der Monoalphabetischen Substitution, wird der Text mit einem Geheimalphabet verschlüsselt. Für mehr info s. Wiki.
Um das zu entschlüsseln, wird erst die Häufgikeit der Buchstaben ermittelt und mit der Häufgikeit der Buchstaben
in der ausgewählten Sprache gleich gesetzt. [https://de.wikipedia.org/wiki/Buchstabenh%C3%A4ufigkeit](https://de.wikipedia.org/wiki/Buchstabenh%C3%A4ufigkeit)
Die Klasse hat also ein Atrribut mit dem Geheimalphabet, wonach der Text entschlüsselt wird. Nach der Analyse, die mit dem Analyse Button gestartet wird,
kann man entweder Buchstaben per Hand tauschen und so den Text entschlüsseln, oder die Klasse macht das automatisch.
Um den Text austomatisch zu lösen, muss man zwei Parameter angeben. Einmal die maximale Anzahl an Tauschen, die der Algorithmus machen darf und
die Teife, die der Algorithmus schauen darf, um den nächstbesten Tausch zu ermitteln. Normalerweise recht eine Tiefe von 1, aber machmal bleibt er an einer Stelle hängen,
Um den nächsten Tausch zu ermitteln, benutzte ich ein ähnlichen Algorithmus wie [Gradient Decent](https://en.wikipedia.org/wiki/Gradient_descent). Wenn der Algorithmus
and einem "False Summit" hängenbleibt, also einem Punkt, von dem kein Tausch den Score verbessert, es aber noch nicht der beste Score ist, kann man probieren die Tiefe zu erhöhen,
damit der Algorithmus weiter in die Zukunft schaut. Jedoch benötigt der Algorithmus deutlich länger, ja höher die Tiefe ist.

### Cäsar
Cäsar Verschlüsselung ist ziemlich einfach zu knacken, da es nur 26 Möglichkeiten gibt.
Wenn man auf den Button ```Verschieben``` drückt, probiert die Klasse einfach alle Möglichkeiten aus und und gibt die mit dem höchsten Score aus.

### Viginere
Bei der Viginere Verschlüsselung gibt es ein Schüsselwort, wonach der Text verschoben wird. [mehr Infos](https://en.wikipedia.org/wiki/Vigen%C3%A8re_cipher).
Um den Text zu knaken, muss man den Text erst in die Klasse laden, mit dem Button ```Text laden```. Dannach, kann man entweder den Text nach einem 
eingegebenen Schüsselwort, per Hand entschlüsseln, oder man lässt den Text analysieren und lässt das Programm de Schlüssel herausfinden.
Der Button ```Länge herausfinden```, ermittelt die Länge des Schlüsselwortes. 

Das wird mithilfe des
[Kasiski Tests](https://de.wikipedia.org/wiki/Kasiski-Test) gemacht.  Mit dem Button ```Key berechnen```, wird der Schlüssel anhand der 
Häufigkeit der Buchstaben berechnet. Erst muss man die Länge des Keys mit dem Kasiski-Test herrausfinden, um dann für jede Stelle die Häufigkeit der Buchstaben zu berechnen.
Darüber kommt man auf den Schlüssel, da jeder n-te Buchstabe (wobei n für die Länge des Schlüssels steht) mit dem selben Buchstaben verschlüsselt wurde und man so
im Prinzip nur n Cäsrverschlüsselungen lösen muss. Problem: Nicht immer ist der Buchstabe der am häufigsten vorkommt gleich dem Buchstaben, der in der ausgewählten
Sprache am häufigsten vorkommt. Deshalb wird nach der ersten Analyse nocheinmal geschaut, ob es Buchstaben gibt, die ähnlich häufig vorkommen und vielleicht einen 
besseren Score erzeilen. So beseitigt man die Buchstaben im Schlüssel, die vielleicht bei der ersten Analyse noch falsch identifiziert wurden.
Jede Stelle wird dann so verschoben, dass es zu den Häufigkeiten der ausgewählten Sprache passt. 

Wenn das mit dem Key berechen nicht funktioniert, kann man
mit dem Button ```Key herausfinden```, ermittelt die Klasse mit brute force, indem er alle Wörter aus einem Datenschatz einer ausgewählten Sprache als Schlüssel ausprobiert
und den Schlüssel mit dem besten Score speichert. Da zum entschlüsseln nur die Worter aus dem Datensatz verwendet werden, muss das Schlüsselwort ein Wort aus der
ausgewählten Sprache sein, sonst funktioniert es nicht. Man kann aber natürlich sich die Länge berechnen lassen und versuchen selbst auf das Schlüsselwort zu kommen.

## Changelog

### V 1.1
- Dateisystem Update
- Englisch hinzugefügt
- Infotab
- Menu Control Update in main.js

### V 1.2
- Kasiski-Test verbesserung (nach längeren Patterns suchen)
- Viginere mit Häufigkeitsanalyse lösen
- score System in eigene Klasse abgesondert
