using KOP.Application.Interfaces.Repositories;
using KOP.Domain.Entities;

namespace KOP.Infrastructure.Persistence.Repositories;

public sealed class MockProsopikoRepository : IProsopikoRepository
{
    private static readonly IReadOnlyList<Stelexos> Stelexi = CreateMockData();

    private static IReadOnlyList<Stelexos> CreateMockData()
    {
        var stelexos1 = new Stelexos
        {
            PebadaId = 116827,
            Rank = "ΣΓΟΣ",
            Eidik = "ΜΗ",
            Onoma = "ΑΡΕΤΗ",
            Eponymo = "ΚΑΡΓΙΩΤΗ",
            Ama = "67995"
        };

        stelexos1.Topothetiseis.Add(
            new StelexosTopothetisi
            {
                Id = 1,
                StelexosPebadaId = stelexos1.PebadaId,
                Stelexos = stelexos1,
                DateParousiasis = new DateTime(2017, 7, 12),
                DateDiagrafis = new DateTime(2023, 10, 19),
                HstrId = 222148,
                HstrTitle = "ΕΤΗΜ/ΔΠΑΡ/ΠΔ/ΗΠ",
                HstrIdMonadas = 222000,
                HstrTitleMonadas = "ΕΤΗΜ",
                EinaiApospasi = false,
                ApospasiSe = null,
                ApospasiSeTitle = string.Empty
            });

        stelexos1.Topothetiseis.Add(
            new StelexosTopothetisi
            {
                Id = 2,
                StelexosPebadaId = stelexos1.PebadaId,
                Stelexos = stelexos1,
                DateParousiasis = new DateTime(2023, 9, 18),
                DateDiagrafis = new DateTime(2023, 9, 29),
                HstrId = 222148,
                HstrTitle = "ΕΤΗΜ/ΔΠΑΡ/ΠΔ/ΗΠ",
                HstrIdMonadas = 222000,
                HstrTitleMonadas = "ETHM",
                EinaiApospasi = true,
                ApospasiSe = 126000,
                ApospasiSeTitle = "ΚΕΑΤ"
            });
        
        stelexos1.Topothetiseis.Add(
            new StelexosTopothetisi
            {
                Id = 3,
                StelexosPebadaId = stelexos1.PebadaId,
                Stelexos = stelexos1,
                DateParousiasis = new DateTime(2023, 10, 20),
                DateDiagrafis = new DateTime(2025, 3, 3),
                HstrId = 900183,
                HstrTitle = "ΕΛΛΑΔΑ ΜΕΤΑΠΤΥΧΙΑΚΟ",
                HstrIdMonadas = 222000,
                HstrTitleMonadas = "ΕΤΗΜ",
                 EinaiApospasi = false,
                ApospasiSe = null,
                ApospasiSeTitle = string.Empty
            });

        var stelexos2 = new Stelexos
        {
            PebadaId = 116837,
            Rank = "ΣΓΟΣ",
            Eidik = "ΜΑ",
            Onoma = "ΑΝΔΡΕΑΣ",
            Eponymo = "ΚΑΤΙΚΑΣ",
            Ama = "67996"
        };

        stelexos2.Topothetiseis.Add(
            new StelexosTopothetisi
            {
                Id = 4,
                StelexosPebadaId = stelexos2.PebadaId,
                Stelexos = stelexos2,
                DateParousiasis = new DateTime(2019, 8, 26),
                DateDiagrafis = null,
                HstrId = 212492,
                HstrTitle = "112ΠΜ/ΜΣΑ-JETS",
                HstrIdMonadas = 212000,
                HstrTitleMonadas = "112ΠΜ",
                EinaiApospasi = false,
                ApospasiSe = null,
                ApospasiSeTitle = string.Empty
            });

        var stelexos3 = new Stelexos
        {
            PebadaId = 29866,
            Rank = "ΕΣΜΙΑΣ",
            Eidik = "ΟΒΡΕ",
            Onoma = "ΕΥΑΓΓΕΛΙΑ",
            Eponymo = "ΚΑΚΑΜΠΟΥΡΑ",
            Ama = "98038"
        };

        stelexos3.Topothetiseis.Add(
            new StelexosTopothetisi
            {
                Id = 5,
                StelexosPebadaId = stelexos3.PebadaId,
                Stelexos = stelexos3,
                DateParousiasis = new DateTime(2022, 9, 2),
                DateDiagrafis = new DateTime(2024, 8, 25),
                HstrId = 212002,
                HstrTitle = "112ΠΜ/Β/Ν ΣΤΑΘΜΟΣ",
                HstrIdMonadas = 212000,
                HstrTitleMonadas = "112ΠΜ",
                EinaiApospasi = false,
                ApospasiSe = null,
                ApospasiSeTitle = string.Empty
            });

        stelexos3.Topothetiseis.Add(
            new StelexosTopothetisi
            {
                Id = 6,
                StelexosPebadaId = stelexos3.PebadaId,
                Stelexos = stelexos3,
                DateParousiasis = new DateTime(2023, 9, 4),
                DateDiagrafis = new DateTime(2023, 10, 3),
                HstrId = 212002,
                HstrTitle = "112ΠΜ/Β/Ν ΣΤΑΘΜΟΣ",
                HstrIdMonadas = 212000,
                HstrTitleMonadas = "112ΠΜ",
                EinaiApospasi = true,
                ApospasiSe = 49000,
                ApospasiSeTitle = "251ΓΝΑ"
            });

        stelexos3.Topothetiseis.Add(
            new StelexosTopothetisi
            {
                Id = 7,
                StelexosPebadaId = stelexos3.PebadaId,
                Stelexos = stelexos3,
                DateParousiasis = new DateTime(2023, 10, 4),
                DateDiagrafis = new DateTime(2023, 11, 2),
                HstrId = 212002,
                HstrTitle = "112ΠΜ/Β/Ν ΣΤΑΘΜΟΣ",
                HstrIdMonadas = 212000,
                HstrTitleMonadas = "112ΠΜ",
                EinaiApospasi = true,
                ApospasiSe = 900181,
                ApospasiSeTitle = "ΓΕΣ/Γ' ΒΝΣΑ"
            });

        stelexos3.Topothetiseis.Add(
            new StelexosTopothetisi
            {
                Id = 8,
                StelexosPebadaId = stelexos3.PebadaId,
                Stelexos = stelexos3,
                DateParousiasis = new DateTime(2023, 11, 3),
                DateDiagrafis = new DateTime(2023, 12, 2),
                HstrId = 212002,
                HstrTitle = "112ΠΜ/Β/Ν ΣΤΑΘΜΟΣ",
                HstrIdMonadas = 212000,
                HstrTitleMonadas = "112ΠΜ",
                EinaiApospasi = true,
                ApospasiSe = 900181,
                ApospasiSeTitle = "ΓΕΣ/Γ' ΒΝΣΑ"
            });

        stelexos3.Topothetiseis.Add(
            new StelexosTopothetisi
            {
                Id = 9,
                StelexosPebadaId = stelexos3.PebadaId,
                Stelexos = stelexos3,
                DateParousiasis = new DateTime(2023, 12, 3),
                DateDiagrafis = new DateTime(2024, 1, 1),
                HstrId = 212002,
                HstrTitle = "112ΠΜ/Β/Ν ΣΤΑΘΜΟΣ",
                HstrIdMonadas = 212000,
                HstrTitleMonadas = "112ΠΜ",
                EinaiApospasi = true,
                ApospasiSe = 900181,
                ApospasiSeTitle = "ΓΕΣ/Γ' ΒΝΣΑ"
            });

        return new List<Stelexos>
        {
            stelexos1,
            stelexos2,
            stelexos3
        };
    }
    

    public Task<IReadOnlyList<Stelexos>> GetProsopikoMeTopothetiseisByMonadaKaiEtosAsync(int hstrIdMonadas, int etosAnaforas, CancellationToken cancellationToken = default)
    {
        var stelexi = Stelexi.Where(i => i.Topothetiseis.Any(t => t.HstrIdMonadas == hstrIdMonadas)).ToList();
        return Task.FromResult<IReadOnlyList<Stelexos>>(stelexi);

        /*
        var result = stelexi
            .SelectMany(stelexos => stelexos.Topothetiseis
                .Where(topothetisi =>
                    topothetisi.HstrMonadaId == hstrMonadaId &&
                    topothetisi.DateParousiasis.Date <= endOfYear &&
                    (topothetisi.DateDiagrafis == null ||
                     topothetisi.DateDiagrafis.Value.Date >= startOfYear))
                .Select(topothetisi =>
                {
                    var dateParousiasisEtous =
                        topothetisi.DateParousiasis.Date < startOfYear
                            ? startOfYear
                            : topothetisi.DateParousiasis.Date;

                    var dateDiagrafis = topothetisi.DateDiagrafis?.Date ?? endOfYear;

                    var dateDiagrafisEtous =
                        dateDiagrafis > endOfYear
                            ? endOfYear
                            : dateDiagrafis;

                    var imeres = (dateDiagrafisEtous - dateParousiasisEtous).Days + 1;

                    return new StelexosTopothetisiEtousDto
                    {
                        PebadaId = stelexos.PebadaId,
                        Rank = stelexos.Rank,
                        Eidik = stelexos.Eidik,
                        Onoma = stelexos.Onoma,
                        Eponymo = stelexos.Eponymo,
                        Ama = stelexos.Ama,

                        HstrMonadaId = topothetisi.HstrMonadaId,
                        HstrMonadaTitle = topothetisi.HstrMonadaTitle,

                        DateParousiasis = topothetisi.DateParousiasis,
                        DateDiagrafis = topothetisi.DateDiagrafis,

                        DateParousiasisEtous = dateParousiasisEtous,
                        DateDiagrafisEtous = dateDiagrafisEtous,

                        Imeres = imeres
                    };
                }))
            .ToList();
        */
    }
}