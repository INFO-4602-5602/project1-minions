# Project1

<h2>The Outset:</h2>
We were provided consumer data by Zayo. Our goal is to create a series of interactive visualizations that can be used to explore different aspects of this data.

<h2>The Data: </h2>
The data received was in the form of a .xlsx workbook with eight worksheets, including the KEY. The other seven are Buildings, Accounts, Sites, CPQs, Opportunities, Services, and Markets, for a total of 41 attributes. We used the relations of some of these attributes to build a database. 
Missing data. In some circumstances, when indispensible data was missing, the entry was not included in the database —e.g. Building ID, X36 NPV List. In the case of Network Proximity, data was imputed using the smallest approximated value calculated by adding the distance to the closest buildings that had values and its Network Proximity.
//TODO Details of DB building process
We have several end points on the server to access the data. These are:
/market_profits: 
/building_profits: 

<h2>The Visualizations:</h2> 
These work encompasses four visualizations:
<ol>
<li>Overview Choropleth Map[1]. The user can select[2] a market and view the total profit of sites not on Zayo Network for that Market. In addition, the user can view a summary[3] other aggregated values for that market as a list.</li> 
<li>Most Profitable Buildings Map. Overlaid on a google map of the selected market in the Choropleth Map, the user can view the buildings in that city that are not on Zayo Network. The user can filter[4] the buildings to view according to different criteria.</li>
<li>Attributes Histogram. Based on the data reduction from Most Profitable Buildings Map, the user can select an attribute from a menu to visualize its distribution[5] as a histogram.</li>
</ol>

<h2>The Designs:</h2> 
<li>Overview Choropleth Map. This visualization shows a map of the United States of America with the state divisions. For the most part, the map is gray, with green highlighting for Colorado, Georgia, and Texas. These three are the states of each of the markets of interest Denver, Atlanta, and Dallas, respectively, which are represented with a circle on their geolocation. The color highlighting of the states (contrast with a binary color hue) combined with the spatial regions help us to facilitate the identification[6] of the three markets of interest. 
The color saturation is used here as a magnitud[7] channel to represents the total profit per Market. The total profit is calculated by aggregating  the values of attribute X36 NPV List for all of the sites that are not on Zayo Network, but located within the specific market. We used an intuitive direct proportional relationship, that is, the higher the saturation, the higher is the total profit. Another marker such as position on a common scale would be more effective in the representation. However, to keep an efficient and simple design with the underlying map, the actual number is render with a mouse-over action.
Typically in choropleth maps, normalized data is preferred to raw data to overcome a common interpretation bias –e.g. when presenting relations that include population.[8] However, we chose total profit –as opposed to a profit density- based on the premise that X36 NPV List reflects already all overhead related to management of the sites –as understood from our discussion in class with a Zayo representative. In a given market, if the premise is correct, more accounts for the same profit would be beneficial for the sustainability of the business. For example, in one market two accounts render the same profit as 20 accounts in another market. If one account leaves, there is a higher impact in one of the markets than in the other. Independent of the business strategy for client proliferation, the attribute total profit is relevant to towards the main goal. 
More information is provided to the user for any selected market by a mouse-click (circles are playfully highlighted by changing size). The overview list contains aggregated values of the number of buildings, the number of Sites, the number of Accounts, the top of Product Group, the average Network Proximity, the average Estimated Build Cost, the Industry type, and the Vertical. </li>
<li>Most Profitable Buildings Map. This is a simple visualization of the geographical location of the buildings in a selected market. The selection occurs in the previous visualization, but this map is rendered on a different frame (div). 
Via a drop down menu the user can filter the view of the buildings that satisfy different criteria –e.g. top ten, top x percent. We selected a cleaner dropdown menu in opposed to the more cluttering option of labeled buttons.</li>
<li>Attributes Histogram. As the name describes, this visualization uses histograms to show the distribution[9] of the values for an user selected attribute. The data used for the histogram has been reduced in the previous visualization Most Profitable Buildings Map. Once more, the selection of the attribute happens via a dropdown menu.</li>

<h2>The Team:</h2> 
We had several brainstorming and working sessions. In general, we were all involved in the project extended to the following: 
Michael Iuzzolino: D3 designs 
Shirly Montero Quesada: Readme
Athithyaa Panchapakesan Rajeswari: Database/Server/Designs on Server 
Santhanakrishnan Ramani: Database/Server/Designs on Server
Nicholas Schardt:Proof read

<h2>How to run the project?:</h2>
The project is available on AWS via the link:
http://ec2-52-36-208-27.us-west-2.compute.amazonaws.com/

<h2>The References: </h2>

<li>[1] Heer, J., Bostock, M., Ogievetsky, V. (2010) A Tour Through the Visualization Zoo. Communications Of The ACM. p63.</li>
<li>[2] as defined in Munzner, T. Visualization Analysis & Design. Boca Raton: CRC Press, 2014. p 249.</li>
<li>[3] Idem 2. p 54</li>
<li>[4] Idem 2. p 300.</li>
<li>[5] Idem2. p 57.</li>
<li>[6] Idem2. p 99.</li>
<li>[7] Ibid 6.</li>
<li>[8] Ibid 1.</li>
<li>[9] Idem2. p 57.</li>

