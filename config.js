async function saveDish(name, desc, price, category) {
    const { data, error } = await supabase
        .from('dishes')
        .insert([
            { name: name, description: desc, price: price, category: category }
        ]);

    if (error) {
        console.error("Erro ao guardar:", error);
    } else {
        alert("Prato guardado na base de dados!");
        // Aqui podes chamar a função para atualizar a tua lista no ecrã
    }
}