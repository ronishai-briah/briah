# אינטגרציית Arbox — ממצאים מאומתים

**עדכון:** יש API רשמי לארבוקס. רוני מצאה את תיעוד ה-API הרשמי.

## פרטים טכניים שאושרו

- **תיעוד**: https://arboxserver.arboxapp.com/docs/api (בנוי על Stoplight — דורש דפדפן עם JS, לא נטען ב-fetch פשוט)
- **Base URL**: `https://arboxserver.arboxapp.com/api/public/v3/`
- **אימות**: API Key (מוגדר כ-"Security: API Key" בכל endpoint)
- **פורמט**: REST רגיל, בקשות/תגובות ב-JSON

## קטגוריות Endpoints שזוהו בתפריט הצד (מהצילום מסך)

| קטגוריה | רלוונטי ל־ |
|---|---|
| **Leads** | מסלול סדנת היכרות/ערב פתוח → הרשמה. יש GET All, POST Create, POST Update Status, POST Mark as Lost, GET Converted, GET Lost, POST Add Note, GET Statuses, GET Sources, GET Lost Reasons |
| **Membership Types** | סוגי המנוי (עוגן/צמיחה/העמקה) — קריטי ל־P0 |
| **Users** | ככל הנראה החברות/החברים עצמם (המנויים הפעילים) — קריטי ל־P0 |
| **Schedule** | מערכת השעות/לוח הסדנאות — קריטי ל־P0 |
| **Tasks** | לא ברור עדיין למה בדיוק בארבוקס — לבדוק |
| **Custom Fields** | ככל הנראה שדות מותאמים אישית על משתמש/ליד |
| **Locations** | רק מיקום אחד רשום בפועל: הירשנברג 14. מזא"ה 9 הוא מרחב מושכר לאירועים בלבד, לא location עצמאי בארבוקס |
| **Message** | שליחת הודעות (וואטסאפ/מייל?) דרך ארבוקס |
| **Reports** | מונה ניצול מפגשים מהמנוי, וככל הנראה גם נתוני הכנסות/הוצאות — **רוני אישרה שיש בארבוקס גם נתוני הכנסות/הוצאות**, לא רק הרשמות/מנויים. לבדוק בפועל אם זה מכסה את כל התמונה הפיננסית (כולל עלויות קבועות כמו שכ"ד ומשכורות) או רק את ההכנסות שעוברות דרך ארבוקס עצמו |
| **Digital Forms** | אולי רלוונטי לטופסי הסכמה/קליטה בעתיד |

## דוגמה מלאה שכבר יש לנו: POST /leads (Create New Lead)

```
POST https://arboxserver.arboxapp.com/api/public/v3/leads
Security: API Key

Body:
- first_name*        string
- last_name          string | null
- email               string | null
- phone*              string
- additional_phone    string | null
- gender              "male" | "female" | "other"
- location_id*        number
- source_id           number | null
- status_id           number | null
- campaign            string | null
- assignee_id         number | null
- comment              string | null
- birthday            date | null
```

(* = חובה)

## מיפוי ל-P0 #1: "חיבור לארבוקס: הרשמה, מערכת שעות, סטטוס מנוי, מונה סשנים"

- הרשמה → `Leads` (למי שעדיין בתהליך היכרות) + כנראה `Users`/`Membership Types` (למי שכבר מנוי)
- מערכת שעות → `Schedule`
- סטטוס מנוי → `Membership Types` + `Users`
- מונה סשנים (ניצול מפגשים החודש) → כנראה `Reports`, לאמת בפועל

## מה עוד חסר לנו (למי שיבנה את זה, כולל Claude Code)

- הפירוט המלא בתוך כל קטגוריה (רק "Leads" נבדק לעומק). **Claude Code יכול וצריך לגלוש בעצמו לתיעוד המלא** בכתובת שלמעלה כשהוא בונה את החיבור בפועל — יש שם הרבה יותר ממה שתועד כאן.
- סכמת ה-`Schema` הכללית (קישור "SCHEMAS" בתחתית התפריט בצילום המסך) — כדאי לבדוק שם את מבנה האובייקטים (Membership, User, Schedule Event וכו').

## איך משיגים API Key בפועל

**חשוב, לביטחון:** אין להדביק את ערך המפתח עצמו בצ'אט או בקבצים — הוא סוד (secret) שנותן הרשאת כתיבה (כמו יצירת לידים). את המפתח מייצרים מתוך הגדרות החשבון בארבוקס, ומוסרים אותו ישירות לסביבת הפיתוח (כמשתנה סביבה מוצפן בפרויקט) כשמתחילים לבנות את החיבור בפועל.
