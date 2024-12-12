// ==UserScript==
// @name        openreview.net 新脚本
// @namespace   Violentmonkey Scripts
// @match       https://openreview.net/forum*
// @grant       none
// @version     2.2
// @author      github.com/Geraldxm
// @description 2024/12/12 22:20:45
// ==/UserScript==

(function() {
    'use strict';

    let ratingDisplayed = false;
    let ratings = [];

    function 获取并显示信息() {
        if (ratingDisplayed) {
            return;
        }

        const notes = document.querySelectorAll('.note');
        if (!notes || notes.length === 0) {
            console.log("未找到评论。");
            return;
        }

        const 过滤器容器 = document.querySelector('.filters-container');

        notes.forEach(note => {
            const noteContent = note.querySelector('.note-content');
            if (!noteContent) {
                return;
            }

            let ratingElement = null;
            let weaknessElement = null;
            let confidenceElement = null;

            const divs = noteContent.querySelectorAll('div > strong.note-content-field');
            divs.forEach(div => {
                if (div.textContent.includes("Rating:")) {
                    ratingElement = div.parentNode;
                    const ratingValue = parseInt(ratingElement.textContent.match(/\d+/)[0]);
                    if (!isNaN(ratingValue)) {
                        ratings.push(ratingValue);
                    }
                } else if (div.textContent.includes("Weaknesses:")) {
                    weaknessElement = div.parentNode;
                } else if (div.textContent.includes("Confidence:")) {
                    confidenceElement = div.parentNode;
                }
            });

            if (ratingElement && weaknessElement && confidenceElement && 过滤器容器) {
                console.log("找到 Rating, Confidence 和 Weaknesses 元素以及过滤器容器。");

                const combinedInfo = document.createElement('div');
                combinedInfo.style.webkitTextSizeAdjust = "100%";
                combinedInfo.style.webkitTapHighlightColor = "rgba(0,0,0,0)";
                combinedInfo.style.fontFamily = "Noto Sans,Helvetica Neue,Helvetica,Arial,sans-serif";
                combinedInfo.style.fontSize = ".75rem";
                combinedInfo.style.lineHeight = "1.125rem";
                combinedInfo.style.boxSizing = "border-box";

                const ratingSpan = document.createElement('span');
                ratingSpan.textContent = ratingElement.textContent.trim();
                ratingSpan.style.fontWeight = "700";
                ratingSpan.style.color = "#8c1b13";
                ratingSpan.style.paddingRight = ".25rem";

                const confidenceSpan = document.createElement('span');
                confidenceSpan.textContent = confidenceElement.textContent.trim();
                confidenceSpan.style.fontWeight = "700";
                confidenceSpan.style.color = "#8c1b13"; // Same color as rating
                confidenceSpan.style.paddingRight = ".25rem";

                const weaknessSpan = document.createElement('span');
                weaknessSpan.textContent = weaknessElement.textContent.trim().replace("Weaknesses:", "");
                weaknessSpan.style.color = "#333";
                weaknessSpan.style.whiteSpace = "pre-wrap";
                weaknessSpan.style.overflowWrap = "break-word";

                combinedInfo.appendChild(ratingSpan);
                combinedInfo.appendChild(document.createElement('br')); // Add a line break after Rating
                combinedInfo.appendChild(confidenceSpan); // Add confidence span here
                combinedInfo.appendChild(document.createElement('br')); // Add a line break before Weaknesses
                combinedInfo.appendChild(weaknessSpan);

                combinedInfo.style.marginTop = '10px';
                combinedInfo.style.border = "1px solid #ccc";
                combinedInfo.style.padding = "5px";

                过滤器容器.insertBefore(combinedInfo, 过滤器容器.firstChild);

            } else if (ratingElement && weaknessElement && confidenceElement) {
                console.log("找到Rating, Confidence和Weaknesses元素, 但未找到过滤器容器")
            } else {
                console.log("未找到所有需要的元素(Rating, Confidence, Weaknesses) 在评论中:", note);
            }
        });

        if (ratings.length > 0 && !ratingDisplayed && 过滤器容器) {
            const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
            const averageRatingElement = document.createElement('div');
            averageRatingElement.style.fontWeight = 'bold';
            averageRatingElement.textContent = `平均分：${averageRating.toFixed(2)}`;

            const ratingsText = ratings.join(", ");
            const ratingsElement = document.createElement('div');
            ratingsElement.style.fontWeight = 'bold';
            ratingsElement.textContent = `所有评分：${ratingsText}`;

            过滤器容器.insertBefore(averageRatingElement, 过滤器容器.firstChild);
            过滤器容器.insertBefore(ratingsElement, 过滤器容器.firstChild);

            ratingDisplayed = true;
            // 观察者.disconnect(); // 可选：停止观察者
        } else if (!ratingDisplayed && 过滤器容器) {
            console.log("未找到任何评分。");
        }
    }

    window.addEventListener('load', 获取并显示信息);

    const 观察者 = new MutationObserver(获取并显示信息);
    观察者.observe(document.body, { childList: true, subtree: true });

    获取并显示信息();

})();