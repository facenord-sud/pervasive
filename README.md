## R

Commandes utiles:

* Transformation de la date: `int$date = as.POSIXct(strptime(int$date, format="%Y-%m-%dT%H:00:00"))`
* lire un CSV: `int <- read.csv("/Users/leo/Documents/uni/master/pervasive/project/datas/r/temp_int.csv", sep=",", header=TRUE, as.is=TRUE)`