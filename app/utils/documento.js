const React = require('react');
const { Page, Text, View, Document, StyleSheet, Image } = require('@react-pdf/renderer');
const path = require('path');
const fs = require('fs');

const imagePath = path.resolve(__dirname, '../img/favicon.ico');
const imageBuffer = fs.readFileSync(imagePath);
const imageBase64 = `data:image/x-icon;base64,${imageBuffer.toString('base64')}`;
// Create styles
const styles = StyleSheet.create({
    container: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "95%",
        height:"15%",
        alignItems: 'flex-start',
        marginLeft: "auto",
        marginRight: "auto",
        borderWidth: 1,
        borderColor: "black",
        marginTop: 20,
        marginBottom: 20,
      },
      table: {
        width: "95%",
        display: "flex",
        justifyContent: "space-between",
        marginLeft: "auto",
        marginRight: "auto",
      },
  column: {
    width: "75%",
    marginLeft: 5,
    marginRight: 20,
    boxSizing: "border-box",
    padding: 10,
  },

  columnImage: {
    width: "50%",
    marginRight: 20,
    boxSizing: "border-box",
  },
  image: {
    width: 100,
    height: 100,
    alignSelf: "flex-end"
  },
  containerHU: {
    flexDirection: 'row', // Alinea los hijos horizontalmente
    justifyContent: 'space-between', // Espacio entre los hijos
    alignItems: 'center', // Alinea los hijos verticalmente
    // Puedes ajustar otros estilos según tus necesidades
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  letters: {
fontSize : 10,
width: "50%",
},
  cliente: {
    width: '100%',
    fontSize: 9,
    display: 'flex',
    justifyContent: 'flex-start',
    marginBottom: 2
  },

 encabezado: {
    width: '16%', padding: 10, borderBottomWidth: 1,borderTopWidth:1, fontSize: 8, fontWeight: "bold",
 },
 encabezadoPrecio: {
  width: '5%', padding: 10, borderBottomWidth: 1,borderTopWidth:1, fontSize: 8, fontWeight: "bold",
},
 encabezadoDesc: {
  width: '37%', padding: 10, borderBottomWidth: 1, borderTopWidth:1, fontSize: 8, fontWeight: "bold", 
},



 celda: {
    width: '16%', paddingHorizontal: 10, paddingVertical:3, fontSize: 7, 
 },
 celdaPrecio: {
  width: '5%', paddingHorizontal: 10, paddingVertical:3, fontSize: 7, 
},
 finales: {
  width: '33.3%', paddingVertical:3, fontSize: 12, 
},
nota: {
  width: '100%', paddingVertical:3, fontSize: 12, display: 'flex', justifyContent: 'center',
},
 celdaDesc: {
  width: '37%', paddingHorizontal: 10, paddingVertical:3, fontSize: 7, 
},
});



// Función que retorna el documento
function MyDocument({ datosCliente, datos, total, items, nota, correlativo, hora, User }) {
  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      // Aquí sigue todo el contenido de tu PDF en forma de createElement...
      React.createElement(View, { style: { flex: 1 } },
        React.createElement(View, { style: styles.container },
          // Columna izquierda con datos del cliente
          React.createElement(View, { style: styles.column },
            React.createElement(View, { style: { marginBottom: 10 } },
              React.createElement(Text, null, `Pedido ${correlativo} ${datosCliente["Nombre"]}`)
            ),
            React.createElement(View, { style: { display: 'flex', justifyContent: 'flex-start' } },
              React.createElement(Text, { style: styles.cliente }, `Razón Social: ${datosCliente["Nombre"]}`),
              React.createElement(Text, { style: styles.cliente }, `Rif: ${datosCliente["Rif"]}`),
              React.createElement(Text, { style: styles.cliente }, `Teléfono: ${datosCliente["Telefonos"]}`),
              datosCliente["Correo Electronico"]
                ? React.createElement(Text, { style: styles.cliente }, `Correo Electrónico: ${datosCliente["Correo Electronico"]}`)
                : null
            )
          ),
          // Columna derecha con imagen
          React.createElement(View, { style: styles.columnImage },
            React.createElement(Image, {
              src: imageBase64,
              style: styles.image
            })
          )
        ),
        React.createElement(View, { style: styles.containerHU },
          React.createElement(View, null,
            React.createElement(Text, { style: styles.letters }, `Fecha: ${hora}`),
            React.createElement(Text, { style: styles.letters }, `Usuario: ${User}`)
          )
        ),
        // Tabla
        React.createElement(View, { style: styles.table },
          // Encabezados
          React.createElement(View, { style: { flexDirection: 'row' } },
            React.createElement(Text, { style: styles.encabezado }, 'Código'),
            React.createElement(Text, { style: styles.encabezadoDesc }, 'Descripción'),
            React.createElement(Text, { style: styles.encabezado }, 'Marca'),
            React.createElement(Text, { style: { width: '11%', padding: 10, borderBottomWidth: 1, borderTopWidth: 1, fontSize: 8, fontWeight: 'bold' } }, 'Referencia'),
            React.createElement(Text, { style: styles.encabezadoPrecio }, 'Cant.'),
            React.createElement(Text, { style: styles.encabezadoPrecio }, 'P.U.'),
            React.createElement(Text, { style: { width: '10%', padding: 10, borderBottomWidth: 1, borderTopWidth: 1, fontSize: 8, fontWeight: 'bold' } }, 'Total')
          ),
          // Filas de datos
          datos.map((d, index) =>
            React.createElement(View, { key: index, style: { flexDirection: 'row' } },
              React.createElement(Text, { style: styles.celda }, d["Código"]),
              React.createElement(Text, { style: styles.celdaDesc }, d["Nombre Corto"]),
              React.createElement(Text, { style: styles.celda }, d["Modelo"]),
              React.createElement(Text, { style: { width: '11%', paddingHorizontal: 10, paddingVertical: 3, fontSize: 7 } }, d["Referencia"]),
              React.createElement(Text, { style: styles.celdaPrecio }, `${d["cantidad"]}`),
              React.createElement(Text, { style: styles.celdaPrecio }, `${d["precio"]}`),
              React.createElement(Text, { style: { width: '10%', paddingHorizontal: 10, paddingVertical: 3, fontSize: 7 } }, `${d["total"]}`)
            )
          )
        ),
        // Totales y nota
        React.createElement(View, {
          style: {
            paddingHorizontal: 20,
            flex: 1,
            flexDirection: 'column',
            alignItems: 'flex-end'
          }
        },
          React.createElement(View, {
            style: {
              justifyContent: 'flex-end',
              height: '80%',
              marginBottom: 5,
              display: 'flex',
              flexDirection: 'row'
            }
          },
            React.createElement(Text, { style: styles.finales }, `Total: ${total.toFixed(2)}`),
            React.createElement(Text, { style: styles.finales }, `Líneas: ${datos.length}`),
            React.createElement(Text, { style: styles.finales }, `Items: ${items}`)
          ),
          React.createElement(View, {
            style: {
              justifyContent: 'flex-end',
              marginBottom: 30,
              display: 'flex',
              flexDirection: 'row'
            }
          },
            React.createElement(Text, { style: styles.nota },
              React.createElement(Text, null, 'Nota: '),
              React.createElement(Text, { style: { width: '30%', fontSize: 10 } }, nota)
            )
          )
        )
      )
    )
  );
}
module.exports = MyDocument;