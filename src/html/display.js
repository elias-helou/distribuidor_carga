function atualiza_atribuicao( disc ) {
    var dido = document.getElementById( disc + "_disc_doc" );
    if ( !dido ) {
        console.log( disc );
        return;
    }

    var doc = atribuicao[ disc ]

    if ( doc.length > 0 ) {
        var mssg = doc[ 0 ];
        for ( var i = 1; i < doc.length; i++ ) {
            mssg = mssg + ", " + doc[ i ];
        }
        dido.innerHTML = mssg;
    }
    else {
        dido.innerHTML = "Não atribuída"
    }

    atualiza_estilo( disc );
}

function atualiza_estilo( disc ) {
    var dc = document.getElementById( disc + "_disc_cont" );
    var doc = atribuicao[ disc ]

    if ( ( doc.length > 0 ) | trava[ disc ] ) {
        dc.className = "disciplina_container_s";
    }
    else {
        dc.className = "disciplina_container";
    }
}

function atualiza_escolhedores( disc ) {
    if ( disciplinas[ disc ][ 'escolhedores' ].length > 0 ) {
        var messg = "Escolhida por: ";
        var doc = disciplinas[ disc ][ 'escolhedores' ][ 0 ][ 1 ];
        messg +=  doc + " (" + disciplinas[ disc ][ 'escolhedores' ][ 0 ][ 0 ] +
            ", " + saldos[ doc ].toFixed( 2 ) + ")";
        for ( let e = 1; e < disciplinas[ disc ][ 'escolhedores' ].length; e++ ){
            var doc = disciplinas[ disc ][ 'escolhedores' ][ e ][ 1 ];
            messg += ( ", " + doc + " (" + disciplinas[ disc ][ 'escolhedores' ][ e ][ 0 ] +
                ", " + saldos[ doc ].toFixed( 2 ) + ")" );
        }
    }
    else {
        var messg = "Não foi escolhida por ninguém" 
    }

    var de = document.getElementById( disc + "_disc_escs" );
    de.innerHTML = messg;
}

function adiciona_disciplina( lista, disc ) {
    var doc = atribuicao[ disc ];

    var dc = document.createElement( "div" );
    dc.id = disc + '_disc_cont';
    dc.addEventListener( "click", adiciona_docente );
    lista.appendChild( dc );
    atualiza_estilo( disc );

    var di = document.createElement( "div" );
    di.className = "disciplina_identificacao";
    di.id = disc + '_disc_ident';
    dc.appendChild( di );

    var cod = document.createElement( "div" );
    cod.className = "disciplina_codigo";
    cod.id = disc + '_disc_cod';
    cod.innerHTML = disciplinas[ disc ][ 'codigo' ];
    di.appendChild( cod );

    var nome = document.createElement( "div" );
    nome.className = "disciplina_nome";
    nome.id = disc + '_disc_nome';
    nome.innerHTML = disciplinas[ disc ][ 'nome' ];
    di.appendChild( nome );

    var dic = document.createElement( "div" );
    dic.className = "disciplina_identificacao";
    dic.id = disc + '_disc_doc_ident';
    dc.appendChild( dic );

    var dido = document.createElement( "div" );
    dido.className = "disciplina_docente";
    dido.id = disc + '_disc_doc';
    dic.appendChild( dido );
    atualiza_atribuicao( disc );

    var dd = document.createElement( "div" );
    dd.className = "disciplina_detalhes";
    dd.id = disc + '_disc_det';
    dc.appendChild( dd );

    var dh = document.createElement( "div" );
    dh.className = "disciplina_horario";
    dh.id = disc + '_disc_hora';
    dh.innerHTML = disciplinas[ disc ][ 'horario' ];
    dd.appendChild( dh );

    var demen = document.createElement( "div" );
    demen.className = "disciplina_ementa";
    demen.id = disc + '_disc_ementa';
    demen.innerHTML = disciplinas[ disc ][ 'ementa' ];
    dd.appendChild( demen );

    var dcursos = document.createElement( "div" );
    dcursos.className = "disciplina_cursos";
    dcursos.id = disc + '_disc_cursos';
    dcursos.innerHTML = disciplinas[ disc ][ 'cursos' ];
    dd.appendChild( dcursos );

    var descs = document.createElement( "div" );
    descs.className = "disciplina_escolhedores";
    descs.id = disc + '_disc_escs';
    dc.appendChild( descs );
    atualiza_escolhedores( disc );
}

function atualiza_lista_disciplinas() {
    var lista = document.getElementById( "lista" );
    lista.innerHTML = "";

        for ( var disc in atribuicao ) {                
            adiciona_disciplina( lista, disc );
        }    
}
