const pool = require('./db');

const telanganaDistricts = [
  { en: 'Hyderabad', te: 'హైదరాబాద్' },
  { en: 'Medchal-Malkajgiri', te: 'మేడ్చల్-మల్కాజిగిరి' },
  { en: 'Ranga Reddy', te: 'రంగారెడ్డి' },
  { en: 'Sangareddy', te: 'సంగారెడ్డి' },
  { en: 'Medak', te: 'మెదక్' },
  { en: 'Siddipet', te: 'సిద్దిపేట' },
  { en: 'Karimnagar', te: 'కరీంనగర్' },
  { en: 'Jagtial', te: 'జగిత్యాల' },
  { en: 'Peddapalli', te: 'పెద్దపల్లి' },
  { en: 'Rajanna Sircilla', te: 'రాజన్న సిరిసిల్ల' },
  { en: 'Nizamabad', te: 'నిజామాబాద్' },
  { en: 'Kamareddy', te: 'కామారెడ్డి' },
  { en: 'Adilabad', te: 'ఆదిలాబాద్' },
  { en: 'Nirmal', te: 'నిర్మల్' },
  { en: 'Mancherial', te: 'మంచిర్యాల' },
  { en: 'Kumuram Bheem Asifabad', te: 'కుమ్రంభీం ఆసిఫాబాద్' },
  { en: 'Khammam', te: 'ఖమ్మం' },
  { en: 'Bhadradri Kothagudem', te: 'భద్రాద్రి కొత్తగూడెం' },
  { en: 'Warangal', te: 'వరంగల్' },
  { en: 'Hanamkonda', te: 'హన్మకొండ' },
  { en: 'Jangaon', te: 'జనగాం' },
  { en: 'Jayashankar Bhupalpally', te: 'జయశంకర్ భూపాలపల్లి' },
  { en: 'Mahabubabad', te: 'మహబూబాబాద్' },
  { en: 'Mulugu', te: 'ములుగు' },
  { en: 'Nalgonda', te: 'నల్గొండ' },
  { en: 'Suryapet', te: 'సూర్యాపేట' },
  { en: 'Yadadri Bhuvanagiri', te: 'యాదాద్రి భువనగిరి' },
  { en: 'Mahabubnagar', te: 'మహబూబ్‌నగర్' },
  { en: 'Nagarkurnool', te: 'నాగర్‌కర్నూల్' },
  { en: 'Wanaparthy', te: 'వనపర్తి' },
  { en: 'Jogulamba Gadwal', te: 'జోగులాంబ గద్వాల్' },
  { en: 'Narayanapet', te: 'నారాయణపేట' },
  { en: 'Vikarabad', te: 'వికారాబాద్' }
];

const apDistricts = [
  { en: 'Srikakulam', te: 'శ్రీకాకుళం' },
  { en: 'Parvathipuram Manyam', te: 'పార్వతీపురం మన్యం' },
  { en: 'Vizianagaram', te: 'విజయనగరం' },
  { en: 'Visakhapatnam', te: 'విశాఖపట్నం' },
  { en: 'Alluri Sitharama Raju', te: 'అల్లూరి సీతారామరాజు' },
  { en: 'Anakapalli', te: 'అనకాపల్లి' },
  { en: 'Kakinada', te: 'కాకినాడ' },
  { en: 'East Godavari', te: 'తూర్పు గోదావరి' },
  { en: 'Dr. B.R. Ambedkar Konaseema', te: 'డాక్టర్ బి.ఆర్. అంబేద్కర్ కోనసీమ' },
  { en: 'Eluru', te: 'ఏలూరు' },
  { en: 'West Godavari', te: 'పశ్చిమ గోదావరి' },
  { en: 'NTR', te: 'ఎన్టీఆర్' },
  { en: 'Krishna', te: 'కృష్ణా' },
  { en: 'Palnadu', te: 'పల్నాడు' },
  { en: 'Guntur', te: 'గుంటూరు' },
  { en: 'Bapatla', te: 'బాపట్ల' },
  { en: 'Prakasam', te: 'ప్రకాశం' },
  { en: 'Sri Potti Sriramulu Nellore', te: 'శ్రీ పొట్టి శ్రీరాములు నెల్లూరు' },
  { en: 'Kurnool', te: 'కర్నూలు' },
  { en: 'Nandyal', te: 'నంద్యాల' },
  { en: 'Anantapur', te: 'అనంతపురం' },
  { en: 'Sri Sathya Sai', te: 'శ్రీ సత్యసాయి' },
  { en: 'YSR', te: 'వైఎస్ఆర్' },
  { en: 'Annamayya', te: 'అన్నమయ్య' },
  { en: 'Tirupati', te: 'తిరుపతి' },
  { en: 'Chittoor', te: 'చిత్తూరు' }
];

const teluguNewsTemplates = [
  { title: "అభివృద్ధి పనులను ప్రారంభించిన అధికారులు", excerpt: "జిల్లాలో పలు అభివృద్ధి పనులను అధికారులు ఈ రోజు లాంఛనంగా ప్రారంభించారు. ఈ కార్యక్రమంలో స్థానిక నేతలు పాల్గొన్నారు." },
  { title: "నూతన విద్యా విధానంపై అవగాహన సదస్సు", excerpt: "విద్యార్థులకు నూతన విద్యా విధానంపై అవగాహన కల్పించేందుకు విద్యాశాఖ ఆధ్వర్యంలో భారీ సదస్సు జరిగింది." },
  { title: "భారీ వర్షాలతో జలమయమైన లోతట్టు ప్రాంతాలు", excerpt: "గత రెండు రోజులుగా కురుస్తున్న భారీ వర్షాలకు జిల్లాలోని పలు లోతట్టు ప్రాంతాలు జలమయమయ్యాయి. అధికారులు అప్రమత్తమయ్యారు." },
  { title: "రైతులకు సబ్సిడీ విత్తనాల పంపిణీ", excerpt: "ఖరీఫ్ సీజన్ నేపథ్యంలో రైతులకు ప్రభుత్వం సబ్సిడీ విత్తనాలను పంపిణీ చేస్తోంది. రైతులు హర్షం వ్యక్తం చేస్తున్నారు." },
  { title: "యువతకు ఉపాధి అవకాశాలపై శిక్షణ", excerpt: "నిరుద్యోగ యువతకు ఉపాధి అవకాశాలు కల్పించే దిశగా నైపుణ్యాభివృద్ధి సంస్థ ఆధ్వర్యంలో ఉచిత శిక్షణా తరగతులు ప్రారంభమయ్యాయి." },
  { title: "ట్రాఫిక్ నిబంధనలపై పోలీసుల ప్రత్యేక డ్రైవ్", excerpt: "వాహనదారులు ట్రాఫిక్ నిబంధనలు పాటించేలా పోలీసులు జిల్లా వ్యాప్తంగా ప్రత్యేక డ్రైవ్ నిర్వహిస్తున్నారు. జరిమానాలు విధిస్తున్నారు." },
  { title: "ఆరోగ్య శిబిరానికి విశేష స్పందన", excerpt: "ప్రభుత్వ ఆసుపత్రిలో నిర్వహించిన ఉచిత మెగా ఆరోగ్య శిబిరానికి ప్రజల నుంచి విశేష స్పందన లభించింది. వందలాది మంది పరీక్షలు చేయించుకున్నారు." },
  { title: "మౌలిక సదుపాయాల కల్పనకు నిధులు మంజూరు", excerpt: "జిల్లాలోని గ్రామీణ ప్రాంతాల్లో మౌలిక సదుపాయాల కల్పన కోసం ప్రభుత్వం అదనపు నిధులను మంజూరు చేసింది." },
  { title: "పారిశుద్ధ్య కార్మికులకు సత్కారం", excerpt: "నగర పరిశుభ్రతలో కీలక పాత్ర పోషిస్తున్న పారిశుద్ధ్య కార్మికులను స్థానిక స్వచ్ఛంద సంస్థ ఘనంగా సత్కరించింది." },
  { title: "పాఠశాలల్లో ఘనంగా క్రీడా పోటీలు", excerpt: "జిల్లా స్థాయి క్రీడా పోటీలు ఈ రోజు పాఠశాలల్లో ఘనంగా ప్రారంభమయ్యాయి. క్రీడాకారులు ఉత్సాహంగా పాల్గొన్నారు." },
  { title: "మహిళా సాధికారతపై ప్రత్యేక సదస్సు", excerpt: "మహిళా సాధికారత, స్వయం ఉపాధిపై మహిళా సంఘాలకు ప్రత్యేక అవగాహన సదస్సు నిర్వహించారు." },
  { title: "అక్రమ రవాణాపై అధికారుల కొరడా", excerpt: "జిల్లా సరిహద్దుల్లో అక్రమ రవాణాను అరికట్టేందుకు అధికారులు తనిఖీలు ముమ్మరం చేశారు. పలువురిని అదుపులోకి తీసుకున్నారు." },
  { title: "లబ్ధిదారులకు పింఛన్ల పంపిణీ", excerpt: "వృద్ధులు, వితంతువులకు నెలవారీ పింఛన్ల పంపిణీ కార్యక్రమం జిల్లా వ్యాప్తంగా సాఫీగా కొనసాగుతోంది." },
  { title: "చెరువుల సుందరీకరణ పనులు వేగవంతం", excerpt: "హరితహారం మరియు పట్టణ ప్రగతిలో భాగంగా స్థానిక చెరువుల సుందరీకరణ పనులను అధికారులు వేగవంతం చేశారు." },
  { title: "విద్యుత్ సరఫరాలో అంతరాయంపై ఫిర్యాదులు", excerpt: "వేసవి తీవ్రతతో విద్యుత్ వినియోగం పెరగడంతో పలు ప్రాంతాల్లో విద్యుత్ కోతలు విధించడంపై స్థానికులు అసహనం వ్యక్తం చేస్తున్నారు." }
];

const extendedParagraphs = [
  "ఈ కార్యక్రమంలో స్థానిక ప్రజాప్రతినిధులు, అధికారులు, ప్రజలు పెద్ద ఎత్తున పాల్గొన్నారు. అభివృద్ధి పనుల వల్ల ప్రజల జీవన ప్రమాణాలు మెరుగుపడతాయని అధికారులు స్పష్టం చేశారు.",
  "ప్రజల సంక్షేమమే ధ్యేయంగా ప్రభుత్వం అనేక పథకాలను ప్రవేశపెడుతోందని, ఈ పథకాలను అర్హులైన ప్రతి ఒక్కరూ సద్వినియోగం చేసుకోవాలని కోరారు.",
  "నగర అభివృద్ధికి సంబంధించి పలు కీలక నిర్ణయాలు తీసుకున్నట్లు అధికారులు తెలిపారు. ముఖ్యంగా మౌలిక వసతుల కల్పనకు ప్రాధాన్యత ఇవ్వనున్నట్లు వెల్లడించారు.",
  "ఈ సందర్భంగా పర్యావరణ పరిరక్షణపై ప్రతి ఒక్కరూ అవగాహన పెంచుకోవాలని, ప్లాస్టిక్ వాడకాన్ని తగ్గించి పచ్చదనాన్ని పెంపొందించాలని పిలుపునిచ్చారు.",
  "సాంకేతిక పరిజ్ఞానాన్ని ఉపయోగించి ప్రజలకు మెరుగైన సేవలు అందించేందుకు చర్యలు తీసుకుంటున్నామని, ఇందుకోసం ప్రత్యేక యాప్‌లను సైతం అందుబాటులోకి తెచ్చినట్లు పేర్కొన్నారు.",
  "యువత నైపుణ్యాలను పెంపొందించే దిశగా వివిధ రకాల శిక్షణా కార్యక్రమాలను నిర్వహిస్తున్నామని, వీటి ద్వారా ఉపాధి అవకాశాలు మెండుగా ఉంటాయని వివరించారు.",
  "ప్రభుత్వ ఆసుపత్రుల్లో మెరుగైన వైద్య సేవలు అందించేందుకు చర్యలు చేపట్టామని, ఆధునిక పరికరాలను సమకూర్చుతున్నామని అధికారులు స్పష్టం చేశారు.",
  "రైతుల సంక్షేమం కోసం ప్రభుత్వం అనేక చర్యలు తీసుకుంటోందని, సకాలంలో రుణాలు, సబ్సిడీ విత్తనాలు అందించేందుకు ఏర్పాట్లు చేశామని తెలిపారు."
];

async function seed() {
  try {
    let tsRes = await pool.query("INSERT INTO categories (name, slug, show_in_header) VALUES ($1, $2, $3) ON CONFLICT (slug) DO UPDATE SET name = $1 RETURNING id", ['తెలంగాణ', 'telangana', true]);
    let apRes = await pool.query("INSERT INTO categories (name, slug, show_in_header) VALUES ($1, $2, $3) ON CONFLICT (slug) DO UPDATE SET name = $1 RETURNING id", ['ఆంధ్రప్రదేశ్', 'andhra-pradesh', true]);
    
    let tsId = tsRes.rows[0].id;
    let apId = apRes.rows[0].id;

    console.log('✅ Created TS and AP categories in Telugu');

    let districtCount = 0;
    let newsCount = 0;

    async function processDistricts(districts, parentId) {
      for (const distObj of districts) {
        let slug = distObj.en.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        
        let catRes = await pool.query(
          "INSERT INTO categories (name, slug, parent_id) VALUES ($1, $2, $3) ON CONFLICT (slug) DO UPDATE SET name = $1 RETURNING id",
          [distObj.te, slug, parentId]
        );
        let distId = catRes.rows[0].id;
        districtCount++;

        let promises = [];
        for (let i = 0; i < 15; i++) {
          let tpl = teluguNewsTemplates[i % teluguNewsTemplates.length];
          let title = `[${distObj.te}] ${tpl.title} - ${i+1}`;
          let newsSlug = `${slug}-news-${i+1}-${Date.now()}-${Math.floor(Math.random()*1000)}`;
          
          let p1 = extendedParagraphs[(i) % extendedParagraphs.length];
          let p2 = extendedParagraphs[(i + 2) % extendedParagraphs.length];
          let p3 = extendedParagraphs[(i + 4) % extendedParagraphs.length];

          let content = `
            <p><strong>${distObj.te}:</strong> జిల్లా వ్యాప్తంగా ఈ రోజు ముఖ్యమైన పరిణామాలు చోటు చేసుకున్నాయి. ${tpl.excerpt}</p>
            <p>${p1}</p>
            <p>${p2}</p>
            <p>${p3}</p>
            <p><strong>మరిన్ని వివరాల కోసం మా వెబ్‌సైట్‌ను అనుసరిస్తూ ఉండండి.</strong></p>
          `;
          
          let image = `https://picsum.photos/seed/${slug}-${i}/800/480`;

          promises.push(
            pool.query(
              "INSERT INTO news (title, slug, content, excerpt, image, author, category_id, is_published, is_trending) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
              [title, newsSlug, content, tpl.excerpt, image, 'Admin', distId, true, i < 3]
            )
          );
        }
        await Promise.all(promises);
        newsCount += 15;
      }
    }

    await pool.query("DELETE FROM news;");
    await pool.query("DELETE FROM categories;");
    
    // recreate main categories because we just deleted everything
    tsRes = await pool.query("INSERT INTO categories (name, slug, show_in_header) VALUES ($1, $2, $3) ON CONFLICT (slug) DO UPDATE SET name = $1 RETURNING id", ['తెలంగాణ', 'telangana', true]);
    apRes = await pool.query("INSERT INTO categories (name, slug, show_in_header) VALUES ($1, $2, $3) ON CONFLICT (slug) DO UPDATE SET name = $1 RETURNING id", ['ఆంధ్రప్రదేశ్', 'andhra-pradesh', true]);
    tsId = tsRes.rows[0].id;
    apId = apRes.rows[0].id;

    await processDistricts(telanganaDistricts, tsId);
    await processDistricts(apDistricts, apId);

    console.log(`✅ Seeded ${districtCount} districts.`);
    console.log(`✅ Seeded ${newsCount} news articles with long content.`);
    process.exit(0);

  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();
