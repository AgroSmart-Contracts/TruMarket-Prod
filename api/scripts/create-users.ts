import mongoose from 'mongoose';

// Define the user schema
const userSchema = new mongoose.Schema({
  email: String,
  accountType: String,
});

// Create the user model
const User = mongoose.model('User', userSchema);

const buyers = [
  'bcopano@bernardinoabad.es',
  'daniel.queiros@biocheers.pt',
  'boris.ramirez@eurofresh.net',
  'oramirez@tropicospain.com',
  'antonio@frutasloscursos.com',
  'arno.hamandjian@georgeshelfer.com',
  'matteo@glamour-fresh.com',
  'pgomez@hispalco.com',
  'acapitan@idealfruits.es',
  'pablo.teutsch@frutasmontosa.com',
  'juan@perezaragricola.com',
  'fabien.lefebvre@sofruce.com',
  'f.schlusnus@tfc-holland.nl',
  'jff@tropicalmillenium.com',
  'mlopez@trops.es',
  'mgine@arola.com',
  'sullivan@bargosa.com',
  'rui.teixeira@freshdor.net',
  'vivien@abcfresh.de',
  'pahumada@alpinefresh.com',
  'angel@transnatrading.com',
  'fabricedejonge@degrootfreshgroup.com',
  'pumartfresc@gmail.com',
  'greg@hlhall.co.uk',
  'bart.de.vries@kraaijeveld.com',
  'pieter.kok@vrugteboom.com',
  'mariacardenas@otcorganics.com',
  'michiel.groenewegen@xfresh.eu',
  'wennekers@berriespride.nl',
  'orlandodalbosco@dimannofruit.com',
  'g.bodini@mavintlsrl.com',
  'export@solenaitalia.com',
  'dirk@dejongfruit.nl',
  'amryj@davisworldwide.co.uk',
  'tim.de.jong@kraaijeveld.com',
  'luis.martinez@sanlucar.com',
  'p.kooi@tfc-holland.nl',
  'zeko@satori.ch',
  'rcedo@cerimacherries.com',
  'hainy.saad@solenaitalia.com',
  'cisse@primeprestige.ci',
  'jreyes@gaiainternational.fr',
  'paultomlinson@davisworldwide.co.uk',
  'info@vanooijentransport.nl',
  'greg@hlhall.co.uk',
  'tiagodewit@otcorganics.com',
  'andrea.dijkhuizen@eosta.com',
  'fabricedejonge@degrootfreshgroup.com',
  'lennart@hillfresh.eu',
  'hisai@hillfresh.eu',
  'izabela.cieslukowska@vrugteboom.com',
  'a.bychkov@ohmygarden.com.ua',
  'robbert@fruitful-berries.com',
  'commercial@lexo-intl.com',
  'anneloes@abbgrowers.com',
  'jandre@grosbusch.lu',
  'antonio@avoseuropa.com',
  'orlandodalbosco@dimannofruit.com',
  'will@nationwideproduce.com',
  'carlosvidal@diegomartinez.com',
  'izabela.cieslukowska@vrugteboom.com',
  'estadisticas@aneberries.mx',
  'biocoop@biocoop.gr',
  'c.vandermeer@bud.nl',
  'dennis.haksteen@zoutewelle.com',
  'dana.malaskova@xfresh.eu',
  'charles@bevafruits.com',
  'cardenas.lyda@fruiver.com',
  'luca.armeri@spreafico.net',
];

const suppliers = [
  'gerencia@tallanespackers.pe',
  'presidencia@apagro.pe',
  'kevin.portalatino@qaraxfoods.pe',
  'wbustamante@agricolasinai.com.pe',
  'rprice@inkasberries.com.pe',
  'luis.cristobal@cultivemos.pe',
  'herrera-comercial@amazonfruit.com.pe',
  'gsamaniego@ecoandino.com',
  'Asos.apagam@gmail.com',
  'caevapa@gmail.com',
  'mantacra@regionhuancavelica.gob.pe',
  'egonzalesc@carashproductores.com',
  'gabriel@alimentojusto.com',
  'mguevara@arandino.com.pe',
  'aremy@agrofrutos.com.pe',
  'sullkataperu@gmail.com',
  'bruno.bianchi@agroism.com.pe',
  'ventas@holyfruitperu.com',
  'asistente.comercioexterior@apromalpi.org.pe',
  'rsuarez@mikhunafoods.com.pe',
  'rony@villaventurapro.com',
];

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/trumarket-api');

mongoose.connection.once('open', async () => {
  console.log('Database connected');

  const buyerUsers = buyers.map((email) => ({ email, accountType: 'buyer' }));
  const supplierUsers = suppliers.map((email) => ({
    email,
    accountType: 'supplier',
  }));

  const users = [...buyerUsers, ...supplierUsers];

  const upsertPromises = users.map((user) =>
    User.updateOne({ email: user.email }, { $set: user }, { upsert: true }),
  );

  await Promise.all(upsertPromises)
    .then((results) => {
      console.log('Users upserted:', results);
    })
    .catch((error) => {
      console.error('Error upserting users:', error);
    });

  mongoose.connection.close();
});
